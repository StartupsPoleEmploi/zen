const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const { get } = require('lodash');
const { uploadsDirectory: uploadDestination } = require('config');

const {
  uploadMiddleware,
  checkPDFValidityMiddleware,
} = require('../lib/upload');
const { requireActiveMonth } = require('../lib/middleware/activeMonthMiddleware');
const {
  fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated,
} = require('../lib/declaration');
const { sendDeclaration } = require('../lib/pe-api/declaration');
const { sendDocument } = require('../lib/pe-api/documents');
const { refreshAccessToken } = require('../lib/middleware/refreshAccessTokenMiddleware');
const { isUserTokenValid } = require('../lib/token');
const winston = require('../lib/log');

const Declaration = require('../models/Declaration');
const Employer = require('../models/Employer');
const EmployerDocument = require('../models/EmployerDocument');
const ActivityLog = require('../models/ActivityLog');
const declarationCtrl = require('../controllers/declarationCtrl');

const { DECLARATION_STATUSES } = require('../constants');

const {
  getPDF,
  numberOfPage,
  removePage,
  handleNewFileUpload,
  IMG_EXTENSIONS,
} = require('../lib/pdf-utils');

router.post('/remove-file-page', (req, res, next) => {
  const { documentType: type, employerId } = req.body;

  if (!employerId) return res.status(400).json('Missing employerId');
  if (!Object.values(EmployerDocument.types).includes(type)) {
    return res.status(400).json('Missing documentType');
  }

  const fetchEmployer = () =>
    Employer.query()
      .eager('documents')
      .findOne({
        id: employerId,
        userId: req.session.user.id,
      });

  return fetchEmployer(req, employerId)
    .then((employer) => {
      if (!employer) return res.status(404).json('No such employer');

      const existingDocument = employer.documents.find(
        (document) =>
          document.type === type && path.extname(document.file) === '.pdf',
      );

      if (!existingDocument) {
        throw new Error(
          `Attempt to remove a page to a non-PDF file for employer ${employerId}, `,
        );
      }

      const pageNumberToRemove = parseInt(req.query.pageNumberToRemove, 10);
      if (!pageNumberToRemove || Number.isNaN(pageNumberToRemove)) {
        return res.status(400).json('No page to remove');
      }

      const pdfFilePath = `${uploadDestination}${existingDocument.file}`;
      return numberOfPage(pdfFilePath)
        .then((pageRemaining) => {
          if (pageRemaining === 1) {
            // Remove last page: delete the file and delete the reference in database
            return new Promise((resolve, reject) => {
              fs.unlink(pdfFilePath, (deleteError) => {
                if (deleteError) return reject(deleteError);
                return existingDocument
                  .$query()
                  .del()
                  .then(resolve)
                  .catch(reject);
              });
            });
          }
          // Only remove the page
          return removePage(pdfFilePath, pageNumberToRemove);
        })
        .then(fetchEmployer)
        .then((updatedEmployer) => res.json(updatedEmployer));
    })
    .catch(next);
});

router.post('/', [requireActiveMonth, refreshAccessToken], (req, res, next) => {
  const sentEmployers = req.body.employers || [];
  if (!sentEmployers.length) return res.status(400).json('No data');

  const getDeclarationDeep = () => Declaration.query()
    .eager('[employers, infos]')
    .findOne({ userId: req.session.user.id, monthId: req.activeMonth.id });

  return getDeclarationDeep()
    .then(async (declaration) => {
      if (!declaration) {
        return res.status(400).json('Please send declaration first');
      }

      const newEmployers = sentEmployers.filter((employer) => !employer.id);
      const updatedEmployers = sentEmployers.filter(({ id }) =>
        declaration.employers.some((employer) => employer.id === id));

      try {
        declaration = await declarationCtrl.updateDeclartionDeep({
          userId: req.session.user.id,
          declaration,
          newEmployers,
          updatedEmployers,
        });
      } catch (err) {
        if (err.status === 400) { return res.status(400).json(err.message); }
      }

      if (!req.body.isFinished) {
        // Temp saving for the user to come back later
        return res.json(declaration);
      }

      if (!isUserTokenValid(req.user.tokenExpirationDate)) {
        return res.status(401).json('Expired token');
      }

      // Sending declaration to pe.fr
      const { body } = await sendDeclaration({
        declaration,
        userId: req.session.user.id,
        accessToken: req.session.userSecret.accessToken,
        ignoreErrors: req.body.ignoreErrors,
        isFakeAuth: req.session.user.isFakeAuth,
      });

      if (body.statut !== DECLARATION_STATUSES.SAVED) {
        // This is a custom error, we want to show a different feedback to users
        return res
          .status(body.statut === DECLARATION_STATUSES.TECH_ERROR ? 503 : 400)
          .json({
            consistencyErrors: body.erreursIncoherence || [],
            validationErrors: Object.values(
              body.erreursValidation || {},
            ),
          });
      }

      winston.info(`Sent declaration for user ${req.session.user.id} to PE`);

      const shouldLog = req.body.isFinished && !declaration.hasFinishedDeclaringEmployers;
      declaration.hasFinishedDeclaringEmployers = true;
      declaration.transmittedAt = new Date();

      return Declaration.transaction(async (trx) => {
        await Declaration.query(trx).findById(declaration.id)
          .patch({
            hasFinishedDeclaringEmployers: declaration.hasFinishedDeclaringEmployers,
            transmittedAt: declaration.transmittedAt,
          });
        if (shouldLog) {
          await ActivityLog.query(trx).insert({
            userId: req.session.user.id,
            action: ActivityLog.actions.VALIDATE_EMPLOYERS,
            metadata: JSON.stringify({
              declarationId: declaration.id,
            }),
          });
        }
        res.json(declaration);
      });
    })
    .catch(next);
});

router.get('/files', (req, res, next) => {
  if (!req.query.documentId) return res.status(400).json('Missing employerId');

  return EmployerDocument.query()
    .eager('employer.user')
    .findOne({
      id: req.query.documentId,
    })
    .then((document) => {
      if (get(document, 'employer.user.id') !== req.session.user.id) {
        return res.status(404).json('No such file');
      }

      const extension = path.extname(document.file);

      // Not a PDF / convertible as PDF file
      if (extension !== '.pdf' && !IMG_EXTENSIONS.includes(extension)) {
        return res.sendFile(document.file, { root: uploadDestination });
      }

      return getPDF(document, uploadDestination).then((pdfPath) => {
        res.sendFile(pdfPath, { root: uploadDestination });
      });
    })
    .catch(next);
});

router.post(
  '/files',
  uploadMiddleware.single('document'),
  checkPDFValidityMiddleware,
  (req, res, next) => {
    const { documentType: type, employerId, skip } = req.body;

    if (!req.file && !skip) return res.status(400).json('Missing file');
    if (!employerId) return res.status(400).json('Missing employerId');
    if (!Object.values(EmployerDocument.types).includes(type)) {
      return res.status(400).json('Missing documentType');
    }

    /*
    2 possibilities :
    * We have an employerId >> it's a new document being added
    * We have a id >> it's a document being updated
  */

    const fetchEmployer = () =>
      Employer.query()
        .eager('[documents, declaration]')
        .findOne({
          id: employerId,
          userId: req.session.user.id,
        });

    return fetchEmployer()
      .then(async (employer) => {
        if (!employer) return res.status(404).json('No such employer');

        const existingDocument = employer.documents.find(
          (document) => document.type === type,
        );
        const isAddingFile = !!req.query.add && existingDocument.originalFileName;

        let documentFileObj = skip
          ? {
            // Used in case the user sent his file by another means.
            file: null,
            originalFileName: null,
            isTransmitted: true,
            type,
          }
          : {
            file: req.file.filename,
            type,
            originalFileName: isAddingFile
              ? existingDocument.originalFileName
              : req.file.originalname,
          };

        if (!skip) {
          const existingDocumentIsPDF = existingDocument && path.extname(existingDocument.file) === '.pdf';

          if (isAddingFile && !existingDocumentIsPDF) {
            // Couldn't happen because 'Add a page' is only available in PDFViewer
            // So the file should already be a PDF (for how long ? FIXME ?)
            throw new Error(
              `Attempt to add a page to a non-PDF file : ${existingDocument.file}`,
            );
          }

          try {
            documentFileObj = await handleNewFileUpload({
              newFilename: req.file.filename,
              existingDocumentFile: existingDocument && existingDocument.file,
              documentFileObj,
              isAddingFile,
            });
          } catch (err) {
            // To get the correct error message front-side,
            // we need to ensure that the HTTP status is 413
            return res.status(413).json(err.message);
          }
        }

        let savePromise;
        if (!existingDocument) {
          savePromise = EmployerDocument.query().insert({
            employerId: employer.id,
            ...documentFileObj,
          });
        } else {
          savePromise = existingDocument.$query().patch({
            ...documentFileObj,
          });
        }

        return savePromise
          .then(fetchEmployer)
          .then((savedEmployer) => {
            if (skip) {
              return fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated({
                declarationId: employer.declaration.id,
                userId: req.session.user.id,
              }).then(() => savedEmployer);
            }
            return savedEmployer;
          })
          .then((savedEmployer) => res.json(savedEmployer));
      })
      .catch(next);
  },
);

router.post('/files/validate', (req, res, next) => {
  if (!isUserTokenValid(req.user.tokenExpirationDate)) {
    return res.status(401).json('Expired token');
  }

  return EmployerDocument.query()
    .eager(
      'employer.[documents, declaration.[user, employers.[documents], declarationMonth, infos]]',
    )
    .findOne({ id: req.body.id })
    .then((employerDoc) => {
      if (
        !employerDoc
        || get(employerDoc, 'employer.declaration.user.id') !== req.session.user.id
      ) {
        return res.status(404).json('Not found');
      }

      if (employerDoc.isTransmitted) return res.json(employerDoc.employer);

      return (
        sendDocument({
          document: employerDoc,
          accessToken: req.session.userSecret && req.session.userSecret.accessToken
            ? req.session.userSecret.accessToken : null,
          isFakeAuth: req.session.user.isFakeAuth,
        })
          .then(() =>
            fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated({
              declarationId: employerDoc.employer.declaration.id,
              userId: req.session.user.id,
            }))
          // FIXME this needs to change, optimal choice is probably to return declaration
          .then(() =>
            Employer.query()
              .eager('documents')
              .findOne({
                id: employerDoc.employer.id,
                userId: req.session.user.id,
              }))
          .then((updatedEmployer) => res.json(updatedEmployer))
      );
    })
    .catch(next);
});

module.exports = router;
