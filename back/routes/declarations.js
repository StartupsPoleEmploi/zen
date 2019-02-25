const express = require('express')

const router = express.Router()
const { get, pick, remove, omit } = require('lodash')
const { transaction } = require('objection')
const Raven = require('raven')

const { DECLARATION_STATUSES } = require('../constants')
const winston = require('../lib/log')
const { upload, uploadDestination } = require('../lib/upload')
const { requireActiveMonth } = require('../lib/activeMonthMiddleware')
const { sendDocuments } = require('../lib/pe-api/documents')
const { sendDeclaration } = require('../lib/pe-api/declaration')
const isUserTokenValid = require('../lib/isUserTokenValid')
const Declaration = require('../models/Declaration')
const DeclarationDocument = require('../models/DeclarationDocument')
const ActivityLog = require('../models/ActivityLog')

const MAX_MONTHS_TO_FETCH = 24 // 2 years

const eagerDeclarationString = `[declarationMonth, documents, employers.documents]`

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

  try {
    Declaration.fromJson(declarationData).$validate()
  } catch (e) {
    Raven.captureException(e)
    return res.status(400).json('Invalid declaration')
  }

  if (!declarationData.hasWorked) {
    declarationData.hasFinishedDeclaringEmployers = true
    declarationData.isTransmitted = true // remove every isTransmitted when PE actu APIs in prod
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
        declaration
          ? declaration.$query(trx).patchAndFetch(declarationData)
          : Declaration.query(trx).insertAndFetch(declarationData)

      const saveAndLogDeclaration = () =>
        transaction(Declaration.knex(), (trx) =>
          saveDeclaration(trx).then((savedDeclaration) =>
            Promise.all([
              savedDeclaration,
              declaration &&
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

      if (declaration && declaration.isFinished) {
        throw new Error('Declaration already done')
      }

      if (!declarationData.hasWorked) {
        // If the user token is invalid, save the declaration data then exit.
        if (!isUserTokenValid(req.user.tokenExpirationDate)) {
          declarationData.hasFinishedDeclaringEmployers = false
          declarationData.isFinished = false
          declarationData.isTransmitted = false // remove every isTransmitted when PE actu APIs in prod
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
            declarationData.isTransmitted = false // remove every isTransmitted when PE actu APIs in prod
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

router.get('/files', (req, res, next) => {
  if (!req.query.documentId) return res.status(400).json('Missing employerId')

  return DeclarationDocument.query()
    .eager('declaration.user')
    .findOne({
      id: req.query.documentId,
    })
    .then((document) => {
      if (get(document, 'declaration.user.id') !== req.session.user.id)
        return res.status(404).json('No such file')
      res.sendFile(document.file, { root: uploadDestination })
    })
    .catch(next)
})

router.post('/files', upload.single('document'), (req, res, next) => {
  if (!req.file && !req.body.skip) return res.status(400).json('Missing file')
  if (!req.body.declarationId) {
    return res.status(400).json('Missing declarationId')
  }

  const userDocumentName = req.body.name

  if (!Object.keys(DeclarationDocument.types).includes(userDocumentName)) {
    return res.status(400).json('Missing document name')
  }

  return Declaration.query()
    .eager(eagerDeclarationString)
    .findOne({ id: req.body.declarationId, userId: req.session.user.id })
    .then((declaration) => {
      if (!declaration) return res.status(400).json('No such declaration')

      const documentFileObj = req.body.skip
        ? {
            // Used in case the user sent his file by another means.
            file: null,
            isTransmitted: true, // DO NOT REMOVE WHEN CLEANING UP declaration.isTransmitted CALLS
            type: userDocumentName,
          }
        : { file: req.file.filename, type: userDocumentName }

      const documentIndex = declaration.documents.findIndex(
        (document) => document.id === parseInt(req.body.documentId, 10),
      )
      if (documentIndex !== -1) {
        declaration.documents[documentIndex] = documentFileObj
      } else {
        declaration.documents.push(documentFileObj)
      }

      return transaction(Declaration.knex(), (trx) =>
        declaration
          .$query(trx)
          .upsertGraph()
          .then(() => res.json(declaration)),
      )
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
    .eager(`[documents, employers.documents, declarationMonth]`)
    .findOne({
      id: req.body.id,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Declaration not found')
      if (declaration.isFinished)
        return res.status(400).json('Declaration already finished')

      // TODO this check will need reviewing when we'll be able to send 2 documents / employer
      const hasMissingEmployersDocuments = declaration.employers.some(
        (employer) => employer.documents.length === 0,
      )

      // TODO this check will need reviewing when we'll be able to send multiple internships / sickLeaves
      const hasMissingDeclarationDocuments =
        (declaration.hasInternship &&
          !declaration.documents.some((doc) => doc.type === 'internship')) ||
        (declaration.hasSickLeave &&
          !declaration.documents.some((doc) => doc.type === 'sickLeave')) ||
        (declaration.hasMaternityLeave &&
          !declaration.documents.some(
            (doc) => doc.type === 'maternityLeave',
          )) ||
        (declaration.hasRetirement &&
          !declaration.documents.some((doc) => doc.type === 'retirement')) ||
        (declaration.hasInvalidity &&
          !declaration.documents.some((doc) => doc.type === 'invalidity'))

      if (
        !declaration.hasFinishedDeclaringEmployers ||
        hasMissingEmployersDocuments ||
        hasMissingDeclarationDocuments
      )
        return res.status(400).json('Declaration not complete')

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
