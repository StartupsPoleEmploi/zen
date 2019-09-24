const express = require('express')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const { get, pick, remove, omit } = require('lodash')
const { transaction } = require('objection')
const Raven = require('raven')

const { DECLARATION_STATUSES } = require('../constants')
const winston = require('../lib/log')
const { upload, uploadDestination } = require('../lib/upload')
const {
  hasMissingEmployersDocuments,
  hasMissingDeclarationDocuments,
} = require('../lib/declaration')
const { requireActiveMonth } = require('../lib/activeMonthMiddleware')
const { sendDocuments } = require('../lib/pe-api/documents')
const { sendDeclaration } = require('../lib/pe-api/declaration')
const isUserTokenValid = require('../lib/isUserTokenValid')
const Declaration = require('../models/Declaration')
const DeclarationInfo = require('../models/DeclarationInfo')
const ActivityLog = require('../models/ActivityLog')
const {
  generatePDFPath,
  getDeclarationPDF,
  getFriendlyPDFName,
} = require('../lib/files')

const {
  getPDF,
  removePage,
  numberOfPage,
  IMG_EXTENSIONS,
  handleNewFileUpload,
} = require('../lib/pdf-utils')

const docTypes = DeclarationInfo.types

const MAX_MONTHS_TO_FETCH = 24 // 2 years

const eagerDeclarationString = `[declarationMonth, infos, employers.documents]`

router.post('/remove-file-page', (req, res, next) => {
  if (!req.body.declarationInfoId) {
    return res.status(400).json('Missing declarationInfoId')
  }

  return DeclarationInfo.query()
    .eager('declaration.user')
    .findById(req.body.declarationInfoId)
    .then((declarationInfo) => {
      if (
        !declarationInfo ||
        !declarationInfo.file ||
        get(declarationInfo, 'declaration.user.id') !== req.session.user.id
      ) {
        return res.status(404).json('No such file')
      }

      const pageNumberToRemove = parseInt(req.query.pageNumberToRemove, 10)
      if (!pageNumberToRemove || Number.isNaN(pageNumberToRemove)) {
        return res.status(400).json('No page to remove')
      }

      if (
        !declarationInfo.file ||
        !path.extname(declarationInfo.file) === '.pdf'
      ) {
        throw new Error(
          `Attempt to remove a page to a non-PDF file : ${declarationInfo.file}`,
        )
      }

      const pdfFilePath = `${uploadDestination}${declarationInfo.file}`

      return numberOfPage(pdfFilePath)
        .then((pageRemaining) => {
          if (pageRemaining === 1) {
            return new Promise((resolve, reject) => {
              fs.unlink(pdfFilePath, (deleteError) => {
                if (deleteError) return reject(deleteError)
                return declarationInfo
                  .$query()
                  .patch({ ...declarationInfo, file: null })
                  .then(resolve)
                  .catch(reject)
              })
            })
          }
          return removePage(pdfFilePath, pageNumberToRemove)
        })
        .then(() =>
          Declaration.query()
            .eager(eagerDeclarationString)
            .findOne({
              id: declarationInfo.declaration.id,
              userId: req.session.user.id,
            }),
        )
        .then((updatedDeclaration) => res.json(updatedDeclaration))
    })
    .catch(next)
})

router.get('/', (req, res, next) => {
  if ('last' in req.query || 'active' in req.query) {
    return Declaration.query()
      .eager(eagerDeclarationString)
      .where({ userId: req.session.user.id })
      .orderBy('createdAt', 'desc')
      .first()
      .then((declaration) => {
        // if we're looking for the active declaration, check last declaration against
        // active month id

        if (
          !declaration ||
          ('active' in req.query &&
            declaration.monthId !== get(req.activeMonth, 'id'))
        ) {
          return res.status(404).json('No such declaration')
        }
        res.json(declaration)
      })
      .catch(next)
  }

  const queryLimit = Math.abs(req.query.limit)
  const limit = Number.isNaN(queryLimit)
    ? MAX_MONTHS_TO_FETCH
    : queryLimit < MAX_MONTHS_TO_FETCH
    ? queryLimit
    : MAX_MONTHS_TO_FETCH

  return Declaration.query()
    .eager(eagerDeclarationString)
    .where({ userId: req.session.user.id })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .then((declarations) => res.json(declarations))
    .catch(next)
})

router.post('/', requireActiveMonth, (req, res, next) => {
  const declarationData = omit(
    {
      // prevent malicious overriding of other user declaration
      ...req.body,
      userId: req.session.user.id,
      monthId: req.activeMonth.id,
    },
    'id',
  )

  if (!declarationData.infos) declarationData.infos = []

  // This next section is dedicated to the validation of infos and correspondance
  // between what will be saved in Declaration and DeclarationInfo.
  try {
    Declaration.fromJson(declarationData).$validate()
    declarationData.infos.forEach((declarationInfo) =>
      DeclarationInfo.fromJson(declarationInfo).$validate(),
    )

    if (
      declarationData.hasInternship &&
      !declarationData.infos.some(({ type }) => type === docTypes.internship)
    ) {
      throw new Error('No internship dates given')
    }
    if (
      declarationData.hasSickLeave &&
      !declarationData.infos.some(({ type }) => type === docTypes.sickLeave)
    ) {
      throw new Error('No sick leave dates given')
    }
    if (
      declarationData.hasMaternityLeave &&
      !declarationData.infos.some(
        ({ type }) => type === docTypes.maternityLeave,
      )
    ) {
      throw new Error('No maternity leave dates given')
    }
    if (
      declarationData.hasRetirement &&
      !declarationData.infos.some(({ type }) => type === docTypes.retirement)
    ) {
      throw new Error('No retirement dates given')
    }
    if (
      declarationData.hasInvalidity &&
      !declarationData.infos.some(({ type }) => type === docTypes.invalidity)
    ) {
      throw new Error('No invalidity dates given')
    }
    if (
      !declarationData.isLookingForJob &&
      !declarationData.infos.some(({ type }) => type === docTypes.jobSearch)
    ) {
      throw new Error('No jobSearch dates given')
    }
  } catch (e) {
    Raven.captureException(e)
    return res.status(400).json('Invalid declaration')
  }

  if (!declarationData.hasWorked) {
    declarationData.hasFinishedDeclaringEmployers = true
    declarationData.transmittedAt = new Date()
    if (!Declaration.needsDocuments(declarationData)) {
      declarationData.isFinished = true
    }
  }

  return Declaration.query()
    .findOne({
      // if req.body.id is defined, this finds the specified declaration
      // otherwise, it still looks for an active declaration for this user this month.
      // (used in case id is not sent, to avoid creating duplicate declarations
      // for example when validating inconsistencies for users who haven't worked)
      id: req.body.id,
      userId: req.session.user.id,
      monthId: req.activeMonth.id,
    })
    .skipUndefined()
    .then((declaration) => {
      const saveDeclaration = (trx) =>
        Declaration.query(trx).upsertGraphAndFetch(declarationData)

      const saveAndLogDeclaration = () =>
        transaction(Declaration.knex(), (trx) =>
          saveDeclaration(trx).then((savedDeclaration) =>
            Promise.all([
              savedDeclaration,
              !declaration &&
                ActivityLog.query(trx).insert({
                  userId: req.session.user.id,
                  action: ActivityLog.actions.VALIDATE_DECLARATION,
                }),
              !declarationData.hasWorked &&
                ActivityLog.query(trx).insert({
                  userId: req.session.user.id,
                  action: ActivityLog.actions.VALIDATE_EMPLOYERS,
                  metadata: JSON.stringify({
                    declarationId: savedDeclaration.id,
                  }),
                }),
            ]),
          ),
        )

      if (declaration) {
        declarationData.id = declaration.id
        if (declaration.isFinished) {
          throw new Error('Declaration already done')
        }
      }

      if (!declarationData.hasWorked) {
        // If the user token is invalid, save the declaration data then exit.
        if (!isUserTokenValid(req.user.tokenExpirationDate)) {
          declarationData.hasFinishedDeclaringEmployers = false
          declarationData.isFinished = false
          declarationData.transmittedAt = null
          return saveDeclaration().then(() =>
            res.status(401).json('Expired token'),
          )
        }

        // Declaration with no employers We need to send the declaration to PE.fr
        return sendDeclaration({
          declaration: declarationData,
          accessToken: req.session.userSecret.accessToken,
          ignoreErrors: req.body.ignoreErrors,
        }).then(({ body }) => {
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

            // in case there was no docs to transmit, don't save the declaration as finished
            // so the user can send it again
            declarationData.hasFinishedDeclaringEmployers = false
            declarationData.isFinished = false
            declarationData.transmittedAt = null
            return saveDeclaration().then(() =>
              // This is a custom error, we want to show a different feedback to users
              res
                .status(
                  body.statut === DECLARATION_STATUSES.TECH_ERROR ? 503 : 400,
                )
                .json({
                  consistencyErrors: body.erreursIncoherence || [],
                  validationErrors: Object.values(body.erreursValidation || {}),
                }),
            )
          }

          winston.info(`Sent declaration for user ${req.session.user.id} to PE`)

          return saveAndLogDeclaration().then(([dbDeclaration]) =>
            res.json(dbDeclaration),
          )
        })
      }

      return saveAndLogDeclaration().then(([dbDeclaration]) =>
        res.json(dbDeclaration),
      )
    })
    .catch(next)
})

router.get('/summary-file', requireActiveMonth, (req, res, next) => {
  const download = req.query.download === 'true'

  return Declaration.query()
    .eager('[declarationMonth, user, employers]')
    .findOne({ id: req.body.id, userId: req.session.user.id })
    .orderBy('createdAt', 'desc')
    .skipUndefined()
    .then((declaration) => {
      if (!declaration) {
        return res.status(404).json('Please send declaration first')
      }

      if (!declaration.hasFinishedDeclaringEmployers) {
        return res.status(403).json('Declaration not complete')
      }

      return getDeclarationPDF(declaration).then(() => {
        const pdfPath = generatePDFPath(declaration)
        const filename = getFriendlyPDFName(declaration)

        if (download) {
          res.download(pdfPath, filename)
        } else {
          res.sendFile(pdfPath)
        }
      })
    })
    .catch(next)
})

router.get('/files', (req, res, next) => {
  if (!req.query.declarationInfoId) {
    return res.status(400).json('Missing declarationInfoId')
  }

  return DeclarationInfo.query()
    .eager('declaration.user')
    .findById(req.query.declarationInfoId)
    .then((declarationInfo) => {
      if (get(declarationInfo, 'declaration.user.id') !== req.session.user.id) {
        return res.status(404).json('No such file')
      }

      const extension = path.extname(declarationInfo.file)

      // Not a PDF / convertible as PDF file
      if (extension !== '.pdf' && !IMG_EXTENSIONS.includes(extension)) {
        return res.sendFile(declarationInfo.file, { root: uploadDestination })
      }

      return getPDF(declarationInfo, uploadDestination).then((pdfPath) => {
        res.sendFile(pdfPath, { root: uploadDestination })
      })
    })
    .catch(next)
})

router.post('/files', upload.single('document'), (req, res, next) => {
  if (!req.file && !req.body.skip) return res.status(400).json('Missing file')
  if (!req.body.declarationInfoId) {
    return res.status(400).json('Missing declarationInfoId')
  }

  return DeclarationInfo.query()
    .eager('declaration.user')
    .findById(req.body.declarationInfoId)
    .then(async (declarationInfo) => {
      if (
        !declarationInfo ||
        declarationInfo.declaration.user.id !== req.session.user.id
      ) {
        return res.status(400).json('No such DeclarationInfo id')
      }

      const isAddingFile = !!req.query.add

      const originalFileName = isAddingFile
        ? declarationInfo.originalFileName
        : req.file.originalname

      let documentFileObj = req.body.skip
        ? {
            // Used in case the user sent his file by another means.
            file: null,
            originalFileName: null,
            isTransmitted: true,
          }
        : {
            file: req.file.filename,
            originalFileName,
          }

      if (!req.body.skip) {
        const existingDocumentIsPDF =
          declarationInfo.file && path.extname(declarationInfo.file) === '.pdf'

        if (isAddingFile && !existingDocumentIsPDF) {
          // Couldn't happen because 'Add a page' is only available in PDFViewer
          // So the file should already be a PDF (for how long ? FIXME ?)
          throw new Error(
            `Attempt to add a page to a non-PDF file : ${declarationInfo.file}`,
          )
        }

        try {
          documentFileObj = await handleNewFileUpload({
            newFilename: req.file.filename,
            existingDocumentFile: declarationInfo.file,
            documentFileObj,
            isAddingFile,
          })
        } catch (err) {
          // To get the correct error message front-side,
          // we need to ensure that the HTTP status is 413
          return res.status(413).json(err.message)
        }
      }

      return declarationInfo
        .$query()
        .patch(documentFileObj)
        .then(() =>
          Declaration.query()
            .eager(eagerDeclarationString)
            .findOne({
              id: declarationInfo.declaration.id,
              userId: req.session.user.id,
            }),
        )
        .then((updatedDeclaration) => res.json(updatedDeclaration))
    })
    .catch(next)
})

/* This busyDeclarations is used to avoid files being sent multiple times
 * It'll be removed when we send documents as they are received.
 */
const busyDeclarations = []

router.post('/finish', (req, res, next) => {
  if (!isUserTokenValid(req.user.tokenExpirationDate)) {
    return res.status(401).json('Expired token')
  }

  return Declaration.query()
    .eager(eagerDeclarationString)
    .findOne({
      id: req.body.id,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Declaration not found')
      if (declaration.isFinished) {
        return res.status(400).json('Declaration already finished')
      }

      if (
        !declaration.hasFinishedDeclaringEmployers ||
        hasMissingEmployersDocuments(declaration) ||
        hasMissingDeclarationDocuments(declaration)
      ) {
        return res.status(400).json('Declaration not complete')
      }

      if (busyDeclarations.includes(declaration.id)) {
        return res.status(400).json('Already busy sending files')
      }
      busyDeclarations.push(declaration.id)

      return sendDocuments({
        declaration,
        accessToken: req.session.userSecret.accessToken,
      })
        .then(() => {
          winston.info(`Files sent for declaration ${declaration.id}`)

          remove(busyDeclarations, (id) => id === declaration.id)

          return transaction(Declaration.knex(), (trx) =>
            Promise.all([
              declaration
                .$query(trx)
                .patch({ isFinished: true })
                .returning('*'),
              ActivityLog.query(trx).insert({
                userId: req.session.user.id,
                action: ActivityLog.actions.VALIDATE_FILES,
                metadata: JSON.stringify({ declarationId: declaration.id }),
              }),
            ]),
          )
        })
        .then(([savedDeclaration]) => res.json(savedDeclaration))
        .catch((err) => {
          remove(busyDeclarations, (id) => id === declaration.id)
          throw err
        })
    })
    .catch(next)
})

module.exports = router
