const express = require('express')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const { transaction } = require('objection')
const {
  get,
  isBoolean,
  isInteger,
  isNumber,
  isString,
  pick,
} = require('lodash')

const { upload, uploadDestination } = require('../lib/upload')
const { requireActiveMonth } = require('../lib/activeMonthMiddleware')
const { sendDeclaration } = require('../lib/pe-api/declaration')
const isUserTokenValid = require('../lib/isUserTokenValid')
const winston = require('../lib/log')

const Declaration = require('../models/Declaration')
const Employer = require('../models/Employer')
const EmployerDocument = require('../models/EmployerDocument')
const ActivityLog = require('../models/ActivityLog')

const { DECLARATION_STATUSES } = require('../constants')

const {
  getPDF,
  numberOfPage,
  removePage,
  handleNewFileUpload,
  IMG_EXTENSIONS,
} = require('../lib/pdf-utils')

const getSanitizedEmployer = ({ employer, declaration, user }) => {
  const workHours = parseFloat(employer.workHours)
  const salary = parseFloat(employer.salary)

  return {
    ...employer,
    userId: user.id,
    declarationId: declaration.id,
    // Save temp data as much as possible
    workHours: !Number.isNaN(workHours) ? workHours : null,
    salary: !Number.isNaN(salary) ? salary : null,
  }
}

router.post('/remove-file-page', (req, res, next) => {
  const { documentType: type, employerId } = req.body

  if (!employerId) return res.status(400).json('Missing employerId')
  if (!Object.values(EmployerDocument.types).includes(type)) {
    return res.status(400).json('Missing documentType')
  }

  const fetchEmployer = () =>
    Employer.query()
      .eager('documents')
      .findOne({
        id: employerId,
        userId: req.session.user.id,
      })

  return fetchEmployer(req, employerId)
    .then((employer) => {
      if (!employer) return res.status(404).json('No such employer')

      const existingDocument = employer.documents.find(
        (document) =>
          document.type === type && path.extname(document.file) === '.pdf',
      )

      if (!existingDocument) {
        throw new Error(
          `Attempt to remove a page to a non-PDF file for employer ${employerId}, `,
        )
      }

      const pageNumberToRemove = parseInt(req.query.pageNumberToRemove, 10)
      if (!pageNumberToRemove || Number.isNaN(pageNumberToRemove)) {
        return res.status(400).json('No page to remove')
      }

      const pdfFilePath = `${uploadDestination}${existingDocument.file}`
      return numberOfPage(pdfFilePath)
        .then((pageRemaining) => {
          if (pageRemaining === 1) {
            // Remove last page: delete the file and delete the reference in database
            return new Promise((resolve, reject) => {
              fs.unlink(pdfFilePath, (deleteError) => {
                if (deleteError) return reject(deleteError)
                return existingDocument
                  .$query()
                  .del()
                  .then(resolve)
                  .catch(reject)
              })
            })
          }
          // Only remove the page
          return removePage(pdfFilePath, pageNumberToRemove)
        })
        .then(fetchEmployer)
        .then((updatedEmployer) => res.json(updatedEmployer))
    })
    .catch(next)
})

router.post('/', requireActiveMonth, (req, res, next) => {
  const sentEmployers = req.body.employers || []
  if (!sentEmployers.length) return res.status(400).json('No data')

  return Declaration.query()
    .eager('[employers, infos]')
    .findOne({
      userId: req.session.user.id,
      monthId: req.activeMonth.id,
    })
    .then((declaration) => {
      if (!declaration) {
        return res.status(400).json('Please send declaration first')
      }

      const newEmployers = sentEmployers.filter((employer) => !employer.id)
      const updatedEmployers = sentEmployers.filter(({ id }) =>
        declaration.employers.some((employer) => employer.id === id),
      )

      declaration.employers = newEmployers
        .concat(updatedEmployers)
        .map((employer) =>
          getSanitizedEmployer({
            employer,
            user: req.session.user,
            declaration,
          }),
        )

      const shouldLog =
        req.body.isFinished && !declaration.hasFinishedDeclaringEmployers

      if (!req.body.isFinished) {
        // Temp saving for the user to come back later
        return declaration
          .$query()
          .upsertGraph()
          .then(() => res.json(declaration))
      }

      // Additional check: Employers declaration is finished and all should be filled
      if (
        declaration.employers.some(
          (employer) =>
            !isString(employer.employerName) ||
            employer.employerName.length === 0 ||
            !isInteger(employer.workHours) ||
            !isNumber(employer.salary) ||
            !isBoolean(employer.hasEndedThisMonth),
        )
      ) {
        return res.status(400).json('Invalid employers declaration')
      }

      if (!isUserTokenValid(req.user.tokenExpirationDate)) {
        return declaration
          .$query()
          .upsertGraph()
          .then(() => res.status(401).json('Expired token'))
      }

      declaration.hasFinishedDeclaringEmployers = true
      declaration.transmittedAt = new Date()

      // Sending declaration to pe.fr
      return sendDeclaration({
        declaration,
        accessToken: req.session.userSecret.accessToken,
        ignoreErrors: req.body.ignoreErrors,
      })
        .then(({ body }) => {
          if (body.statut !== DECLARATION_STATUSES.SAVED) {
            // the service will answer with HTTP 200 for a bunch of errors
            // So they need to be handled here
            winston.warn(
              `Declaration transmission error for user ${req.session.user.id}`,
              pick(body, [
                'statut',
                'statutActu',
                'message',
                'erreursIncoherence',
                'erreursValidation',
              ]),
            )

            declaration.hasFinishedDeclaringEmployers = false
            declaration.transmittedAt = null

            return declaration
              .$query()
              .upsertGraph()
              .then(() =>
                // This is a custom error, we want to show a different feedback to users
                res
                  .status(
                    body.statut === DECLARATION_STATUSES.TECH_ERROR ? 503 : 400,
                  )
                  .json({
                    consistencyErrors: body.erreursIncoherence || [],
                    validationErrors: Object.values(
                      body.erreursValidation || {},
                    ),
                  }),
              )
          }

          winston.info(`Sent declaration for user ${req.session.user.id} to PE`)

          return transaction(Declaration.knex(), (trx) =>
            Promise.all([
              declaration.$query(trx).upsertGraph(),
              shouldLog
                ? ActivityLog.query(trx).insert({
                    userId: req.session.user.id,
                    action: ActivityLog.actions.VALIDATE_EMPLOYERS,
                    metadata: JSON.stringify({
                      declarationId: declaration.id,
                    }),
                  })
                : Promise.resolve(),
            ]),
          ).then(() => res.json(declaration))
        })
        .catch((err) => {
          // If we could not save the declaration on pe.fr
          // We still save the data the user sent us
          // but we put it as unfinished.
          declaration.hasFinishedDeclaringEmployers = false
          declaration.transmittedAt = null

          return declaration
            .$query()
            .upsertGraph()
            .then(() => {
              throw err
            })
        })
    })
    .catch(next)
})

router.get('/files', (req, res, next) => {
  if (!req.query.documentId) return res.status(400).json('Missing employerId')

  return EmployerDocument.query()
    .eager('employer.user')
    .findOne({
      id: req.query.documentId,
    })
    .then((document) => {
      if (get(document, 'employer.user.id') !== req.session.user.id) {
        return res.status(404).json('No such file')
      }

      const extension = path.extname(document.file)

      // Not a PDF / convertible as PDF file
      if (extension !== '.pdf' && !IMG_EXTENSIONS.includes(extension)) {
        return res.sendFile(document.file, { root: uploadDestination })
      }

      return getPDF(document, uploadDestination).then((pdfPath) => {
        res.sendFile(pdfPath, { root: uploadDestination })
      })
    })
    .catch(next)
})

router.post('/files', upload.single('document'), (req, res, next) => {
  const { documentType: type, employerId, skip } = req.body

  if (!req.file && !skip) return res.status(400).json('Missing file')
  if (!employerId) return res.status(400).json('Missing employerId')
  if (!Object.values(EmployerDocument.types).includes(type)) {
    return res.status(400).json('Missing documentType')
  }

  /*
    2 possibilities :
    * We have an employerId >> it's a new document being added
    * We have a id >> it's a document being updated
  */

  const fetchEmployer = () =>
    Employer.query()
      .eager('documents')
      .findOne({
        id: employerId,
        userId: req.session.user.id,
      })

  return fetchEmployer()
    .then(async (employer) => {
      if (!employer) return res.status(404).json('No such employer')

      const isAddingFile = !!req.query.add

      const existingDocument = employer.documents.find(
        (document) => document.type === type,
      )

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
          }

      if (!skip) {
        const existingDocumentIsPDF =
          existingDocument && path.extname(existingDocument.file) === '.pdf'

        if (isAddingFile && !existingDocumentIsPDF) {
          // Couldn't happen because 'Add a page' is only available in PDFViewer
          // So the file should already be a PDF (for how long ? FIXME ?)
          throw new Error(
            `Attempt to add a page to a non-PDF file : ${existingDocument.file}`,
          )
        }

        try {
          documentFileObj = await handleNewFileUpload({
            newFilename: req.file.filename,
            existingDocumentFile: existingDocument && existingDocument.file,
            documentFileObj,
            isAddingFile,
          })
        } catch (err) {
          // To get the correct error message front-side,
          // we need to ensure that the HTTP status is 413
          return res.status(413).json(err.message)
        }
      }

      let savePromise
      if (!existingDocument) {
        savePromise = EmployerDocument.query().insert({
          employerId: employer.id,
          ...documentFileObj,
        })
      } else {
        savePromise = existingDocument.$query().patch({
          ...documentFileObj,
        })
      }

      return savePromise
        .then(fetchEmployer)
        .then((savedEmployer) => res.json(savedEmployer))
    })
    .catch(next)
})

module.exports = router
