const imagesToPdf = require('images-to-pdf');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const pdftk = require('node-pdftk');
const sharp = require('sharp');

const imagemin = require('imagemin-keep-folder');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

const { uploadsDirectory: uploadDestination } = require('config');
const winston = require('./log');

pdftk.configure({ bin: 'pdftk' });

const IMG_EXTENSIONS = ['.png', '.jpeg', '.jpg'];
const MAX_PDF_SIZE = 5;
const MAX_IMAGE_DIMENSION = 1500; // in pixel
const MIN_IMAGE_SIZE_FOR_OPTIMISATION = 1000000;

const unlink = util.promisify(fs.unlink);
const stat = util.promisify(fs.stat);

const getFileBasename = (filename) =>
  path.basename(filename, path.extname(filename));

const getPDF = (document, directory) => {
  const originalFileName = document.file;

  const fileBaseName = getFileBasename(originalFileName);

  const pdfFileName = `${fileBaseName}.pdf`;

  return new Promise((resolve, reject) => {
    const pdfFilePath = `${directory}${pdfFileName}`;
    const imgFilePath = `${directory}${originalFileName}`;

    fs.access(pdfFilePath, (error) => {
      // PDF already converted ?
      if (!error) {
        return resolve(pdfFileName);
      }

      imagesToPdf([imgFilePath], pdfFilePath)
        .then(() => document.$query().patch({ file: pdfFileName }))
        .then(() =>
          fs.unlink(imgFilePath, (deleteError) =>
            (deleteError ? reject(deleteError) : resolve(pdfFileName))))
        .catch((err) => {
          winston.warn(err);
          reject(err);
        });
    });
  });
};

// This command will throw a promise error if the pdf is invalid
const checkPDFValidity = (filePath) => exec(`pdfinfo ${filePath}`);

const numberOfPage = (filePath) =>
  exec(`pdfinfo ${filePath} | grep Pages | sed 's/[^0-9]*//'`).then((res) =>
    parseInt(res.stdout.replace('\n', ''), 10));

async function optimizePDF(pdfFilePath) {
  const tmpFilePath = pdfFilePath.replace('.pdf', '-tmp.pdf');
  const psFilePath = pdfFilePath.replace('.pdf', '.ps');

  try {
    const { size: oldSize } = await stat(pdfFilePath);
    await exec(
      `pdf2ps -dSAFER -sPAPERSIZE=a4 ${pdfFilePath} ${psFilePath} && ps2pdf -dSAFER -sPAPERSIZE=a4 ${psFilePath} ${tmpFilePath} && rm ${psFilePath}`,
    );
    const { size: newSize } = await stat(tmpFilePath);
    if (oldSize > newSize) {
      await exec(`mv ${tmpFilePath} ${pdfFilePath}`);
    }
  } finally {
    await exec(`rm -rf ${tmpFilePath}`);
  }
}

const resizeImage = (imgFilePath) =>
  new Promise((resolve, reject) => {
    sharp(imgFilePath)
      .resize({ width: MAX_IMAGE_DIMENSION, withoutEnlargement: true })
      .toBuffer((err, buffer) => {
        // Update image with the new content
        if (err) return reject(err);
        fs.writeFile(imgFilePath, buffer, (wrErr) => {
          if (wrErr) return reject(wrErr);
          resolve();
        });
      });
  });

const optimizeImage = (imgFilePath) =>
  imagemin([imgFilePath], {
    plugins: [
      imageminMozjpeg({ quality: 75 }),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });

async function transformImageToPDF(filename) {
  const fileBaseName = getFileBasename(filename);
  const pdfFilePath = `${uploadDestination}${fileBaseName}.pdf`;
  const imgFilePath = `${uploadDestination}${filename}`;

  // optimize image if possible
  const { size } = await stat(imgFilePath).catch((err) => {
    winston.warn(`Error on transformImageToPDF when get stat of file (${filename}): ${err}`);
    throw err;
  });
  if (size > MIN_IMAGE_SIZE_FOR_OPTIMISATION) {
    await resizeImage(imgFilePath).catch((err) => {
      winston.warn(`Error on transformImageToPDF when resizeImage (${filename}): ${err}`);
    });
    await optimizeImage(imgFilePath).catch((err) => {
      winston.warn(`Error on transformImageToPDF when optimizeImage (${filename}): ${err}`);
    });
  }

  // transform image
  await imagesToPdf([imgFilePath], pdfFilePath).catch((err) => {
    winston.error(`Error when transforming image (${filename}) to pdf: ${err.message}`, err);
    throw err;
  });
  await unlink(imgFilePath).catch((err) => {
    winston.warn(`Error on transformImageToPDF when unlink file (${filename}): ${err}`);
  });
}

const mergePDF = (file1, file2, output) =>
  pdftk
    .input({
      A: file1,
      B: file2,
    })
    .cat('A B')
    .output(output);

const handleNewFileUpload = async ({
  newFilename,
  existingDocumentFile,
  documentFileObj,
  isAddingFile,
}) => {
  if (IMG_EXTENSIONS.includes(path.extname(newFilename))) {
    await transformImageToPDF(newFilename);
    documentFileObj = {
      ...documentFileObj,
      file: `${getFileBasename(newFilename)}.pdf`,
    };
  } else if (path.extname(newFilename) === '.pdf') {
    const fileName = `${uploadDestination}${newFilename}`;

    const pdfFileSize = await numberOfPage(fileName);
    if (pdfFileSize > MAX_PDF_SIZE) {
      throw new Error(`PDF will exceed ${MAX_PDF_SIZE} pages`);
    }

    await optimizePDF(fileName).catch((err) =>
      // if the optimization fails, log it, but continue anyway
      winston.debug(`Error when optimizing document ${fileName} (ERR ${err})`, {
        error: err,
      }));
  }

  if (
    isAddingFile
    && path.extname(documentFileObj.file) === '.pdf'
    && path.extname(existingDocumentFile) === '.pdf'
  ) {
    // We can attempt a PDF merge
    const additionFilePath = `${uploadDestination}${documentFileObj.file}`;
    const existingFilePath = `${uploadDestination}${existingDocumentFile}`;

    // Check if future PDF is not above to {MAX_PDF_SIZE} pages
    const additionalFileSize = await numberOfPage(additionFilePath);
    const currentFileSize = await numberOfPage(existingFilePath);
    if (additionalFileSize + currentFileSize > MAX_PDF_SIZE) {
      throw new Error(`PDF will exceed ${MAX_PDF_SIZE} pages`);
    }

    await mergePDF(
      `${uploadDestination}${existingDocumentFile}`,
      `${uploadDestination}${documentFileObj.file}`,
      `${uploadDestination}${existingDocumentFile}`,
    );
    await unlink(`${uploadDestination}${documentFileObj.file}`).catch((err) => {
      winston.warn(`Error on handleNewFileUpload when unlink file (${documentFileObj.file}): ${err}`);
    });

    // If merging in successful or not, we need to keep that the file in DB is the old file name
    documentFileObj = { ...documentFileObj, file: existingDocumentFile };
  }
  return documentFileObj;
};

const removePage = (filePath, pageNumberToRemove) =>
  // Compute cat argument for pdftk :https://doc.ubuntu-fr.org/pdftk#concatenation
  numberOfPage(filePath).then((pageNumber) => {
    if (pageNumber === 1) throw new Error("Can't remove the only page");

    let cat;
    if (pageNumberToRemove === 1) {
      // First page
      cat = 'A2-end';
    } else if (pageNumberToRemove === pageNumber) {
      // Last page
      cat = `A1-${pageNumberToRemove - 1}`;
    } else {
      const firstPartEnd = pageNumberToRemove - 1;
      const secondPartBegin = pageNumberToRemove + 1;
      cat = `A1-${firstPartEnd} ${secondPartBegin}-end`;
    }

    return pdftk
      .input({
        A: filePath,
      })
      .cat(cat)
      .output(filePath);
  });

module.exports = {
  getPDF,
  getFileBasename,
  mergePDF,
  removePage,
  numberOfPage,
  transformImageToPDF,
  handleNewFileUpload,
  IMG_EXTENSIONS,
  optimizePDF,
  checkPDFValidity,
};
