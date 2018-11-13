const express = require('express')

const router = express.Router()
const { get, reduce, omit } = require('lodash')
const { transaction } = require('objection')
const { format } = require('date-fns')

const { DECLARATION_STATUSES } = require('../constants')
const { upload, uploadDestination } = require('../lib/upload')
const { requireActiveMonth } = require('../lib/activeMonthMiddleware')
const { sendDocuments } = require('../lib/pe-api/documents')
const { sendDeclaration } = require('../lib/pe-api/declaration')
const isUserTokenValid = require('../lib/isUserTokenValid')
const Declaration = require('../models/Declaration')
const Document = require('../models/Document')
const ActivityLog = require('../models/ActivityLog')

const declarationDateFields = [
  'internshipStartDate',
  'internshipEndDate',
  'sickLeaveStartDate',
  'sickLeaveEndDate',
  'maternityLeaveStartDate',
  'retirementStartDate',
  'invalidityStartDate',
  'jobSearchEndDate',
]

const possibleDocumentTypes = [
  'internshipDocument',
  'sickLeaveDocument',
  'maternityLeaveDocument',
  'retirementDocument',
  'invalidityDocument',
]

router.get('/', (req, res, next) => {
  if ('last' in req.query || 'active' in req.query) {
    return Declaration.query()
      .eager(
        `[${possibleDocumentTypes.join(
          ', ',
        )}, declarationMonth, employers.document]`,
      )
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

  return Declaration.query()
    .eager(
      `[${possibleDocumentTypes.join(
        ', ',
      )}, employers.document, declarationMonth]`,
    )
    .where({ userId: req.session.user.id })
    .orderBy('createdAt', 'desc')
    .limit(24) // 2 years
    .then((declarations) => res.json(declarations))
    .catch(next)
})

router.post('/', requireActiveMonth, (req, res, next) => {
  const declarationData = reduce(
    omit(
      {
        // prevent malicious overriding of other user declaration
        ...req.body,
        userId: req.session.user.id,
        monthId: req.activeMonth.id,
      },
      'id',
    ),
    // format dates with date-fns for db insertion so they'll be at the correct day
    // (dates may be in ISOString format, and are not converted when sent to a
    // DATE field in the db)
    (prev, field, key) => ({
      ...prev,
      [key]: declarationDateFields.includes(key)
        ? field && format(field, 'YYYY-MM-DD')
        : field,
    }),
    {},
  )

  if (!declarationData.hasWorked) {
    declarationData.hasFinishedDeclaringEmployers = true
    if (
      ![
        'hasTrained',
        'hasInternship',
        'hasSickLeave',
        'hasMaternityLeave',
        'hasRetirement',
        'hasInvalidity',
      ].some((hasSomething) => declarationData[hasSomething])
    ) {
      declarationData.isFinished = true
    }
  }

  const declarationFetchPromise = req.body.id
    ? Declaration.query().findOne({
        id: req.body.id,
        userId: req.session.user.id,
      })
    : Promise.resolve()

  return declarationFetchPromise
    .then((declaration) => {
      const saveDeclaration = (trx) =>
        declaration
          ? declaration.$query(trx).patchAndFetch(declarationData)
          : Declaration.query(trx).insertAndFetch(declarationData)

      const saveAndLogDeclaration = () =>
        transaction(Declaration.knex(), (trx) =>
          Promise.all([
            saveDeclaration(trx),
            ActivityLog.query(trx).insert({
              userId: req.session.user.id,
              action: ActivityLog.actions.VALIDATE_DECLARATION,
              isModification: !!declaration,
            }),
            declaration &&
              !declaration.hasWorked &&
              declarationData.hasWorked &&
              ActivityLog.query(trx).insert({
                userId: req.session.user.id,
                action: ActivityLog.actions.VALIDATE_EMPLOYERS,
              }),
          ]),
        )

      if (declaration && declaration.isFinished) {
        throw new Error('Declaration already done')
      }

      if (!declarationData.hasWorked) {
        // If the user token is invalid, save the declaration data then exit.
        if (!isUserTokenValid(req.user.tokenExpirationDate)) {
          declarationData.hasFinishedDeclaringEmployers = false
          declarationData.isFinished = false
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

            // in case there was no docs to transmit, don't save the declaration as finished
            // so the user can send it again
            declarationData.hasFinishedDeclaringEmployers = false
            declarationData.isFinished = false
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
  if (!req.query.declarationId || !req.query.name)
    return res.status(400).json('Missing parameters')

  return Declaration.query()
    .eager(`[${possibleDocumentTypes.join(', ')}]`)
    .findOne({ id: req.query.declarationId, userId: req.session.user.id })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')
      if (!declaration[req.query.name] || !declaration[req.query.name].file) {
        return res.status(404).json('No such file')
      }

      res.sendFile(declaration[req.query.name].file, {
        root: uploadDestination,
      })
    })
    .catch(next)
})

router.post('/files', upload.single('document'), (req, res, next) => {
  if (!req.file && !req.body.skip) return res.status(400).json('Missing file')
  if (!req.body.declarationId) {
    return res.status(400).json('Missing declarationId')
  }

  const userDocumentName = req.body.name

  if (!possibleDocumentTypes.includes(userDocumentName)) {
    return res.status(400).json('Missing document name')
  }

  return Declaration.query()
    .eager(`[${possibleDocumentTypes.join(', ')}]`)
    .findOne({ id: req.body.declarationId, userId: req.session.user.id })
    .then((declaration) => {
      if (!declaration) return res.status(400).json('No such declaration')

      // FIXME all the following should be replaced using an upsertGraph
      // which failed because of null value in column "id" violates not-null constraint
      // (also, validation of id field in model should probably be removed)

      return transaction(Declaration.knex(), (trx) => {
        const documentFileObj = req.body.skip
          ? {
              // Used in case the user sent his file by another means.
              file: null,
              isTransmitted: true,
            }
          : { file: req.file.filename }

        const documentPromise = declaration[userDocumentName]
          ? declaration[userDocumentName].$query().patch(documentFileObj)
          : Document.query().insert(documentFileObj)

        return documentPromise
          .returning('*')
          .then((savedDocument) =>
            declaration
              .$query(trx)
              .patchAndFetch({ [`${userDocumentName}Id`]: savedDocument.id })
              .eager(
                `[${possibleDocumentTypes.join(
                  ', ',
                )}, employers.document, declarationMonth]`,
              ),
          )
          .then((savedDeclaration) => res.json(savedDeclaration))
      }).catch(next)
    })
})

router.post('/finish', (req, res, next) => {
  if (!isUserTokenValid(req.user.tokenExpirationDate)) {
    return res.status(401).json('Expired token')
  }

  return Declaration.query()
    .eager(
      `[${possibleDocumentTypes.join(
        ', ',
      )}, employers.document, declarationMonth]`,
    )
    .findOne({
      id: req.body.id,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Declaration not found')
      if (declaration.isFinished)
        return res.status(400).json('Declaration already finished')

      const hasMissingEmployersDocuments = declaration.employers.some(
        ({ documentId }) => !documentId,
      )
      const hasMissingDeclarationDocuments =
        (declaration.hasInternship && !declaration.internshipDocumentId) ||
        (declaration.hasSickLeave && !declaration.sickLeaveDocumentId) ||
        (declaration.hasMaternityLeave &&
          !declaration.maternityLeaveDocumentId) ||
        (declaration.hasRetirement && !declaration.retirementDocumentId) ||
        (declaration.hasInvalidity && !declaration.invalidityDocumentId)

      if (
        !declaration.hasFinishedDeclaringEmployers ||
        hasMissingEmployersDocuments ||
        hasMissingDeclarationDocuments
      )
        return res.status(400).json('Declaration not complete')

      return sendDocuments({
        declaration,
        accessToken: req.session.userSecret.accessToken,
      })
        .then(() =>
          transaction(Declaration.knex(), (trx) =>
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
          ),
        )
        .then(([savedDeclaration]) => res.json(savedDeclaration))
    })
    .catch(next)
})

module.exports = router
