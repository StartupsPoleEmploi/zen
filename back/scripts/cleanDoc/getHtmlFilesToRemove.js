/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const fs = require('fs');
const util = require('util');
const path = require('path');
const { uploadsDirectory } = require('config');
const exec = util.promisify(require('child_process').exec);

async function getAllFileInStorage() {
  const readdir = util.promisify(fs.readdir);
  return readdir(uploadsDirectory);
}

async function isInvalidePDF(file) {
  return exec(`pdfinfo ${path.join(uploadsDirectory, file)}`)
    .then(() => false)
    .catch(() => true);
}

async function isHtml(file) {
  return exec(`grep -R "<body" ${path.join(uploadsDirectory, file)}`)
    .then(() => true)
    .catch(() => false);
}

async function start() {
  console.log('getAllFileInStorage...');
  const filesInStorage = await getAllFileInStorage();
  const invalideFiles = [];

  while (filesInStorage.length) {
    console.log(
      `Still ${filesInStorage.length} files`,
      JSON.stringify(invalideFiles),
      invalideFiles.length,
    );

    const files = filesInStorage.splice(0, 1000);
    await Promise.all(
      files.map(async (file) => {
        if (path.extname(file) === '.pdf') {
          if (await isInvalidePDF(file)) {
            invalideFiles.push(file);
          }
        } else if (await isHtml(file)) {
          invalideFiles.push(file);
        }
      }),
    );
  }

  console.log('**************************************************************');
  console.log(
    'invalideFiles',
    JSON.stringify(invalideFiles),
    invalideFiles.length,
  );
  console.log('END');
}

start();
