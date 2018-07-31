const express = require('express')

const router = express.Router()
const { omit } = require('lodash')
const { transaction } = require('objection')

const { upload, uploadDestination } = require('../lib/upload')
const Declaration = require('../models/Declaration')
const Document = require('../models/Document')
const ActivityLog = require('../models/ActivityLog')

router.get('/', (req, res, next) => {
  if (!('last' in req.query)) return res.status(400).json('Route not ready')

  return Declaration.query()
    .eager(
      '[trainingDocument, internshipDocument, sickLeaveDocument, maternityLeaveDocument, retirementDocument, invalidityDocument]',
    )
    .findOne({ monthId: req.activeMonth.id, userId: req.session.user.id })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')
      res.json(declaration)
    })
    .catch(next)
})

router.post('/', (req, res, next) => {
  // TODO change this so the client sends a month, not an id
  const declarationData = omit(
    {
      ...req.body,
      userId: req.session.user.id,
      monthId: req.activeMonth.id,
    },
    'id',
  ) // prevent malicious overriding of other user declaration

  const declarationFetchPromise = req.body.id
    ? Declaration.query().findOne({
        id: req.body.id,
        userId: req.session.user.id,
      })
    : Promise.resolve()

  return declarationFetchPromise
    .then((declaration) => {
      let declarationPromise
      let activityLogPromise = Promise.resolve()
      if (declaration) {
        declarationPromise = declaration
          .$query()
          .patch(declarationData)
          .returning('*')
      } else {
        declarationPromise = Declaration.query()
          .insert(declarationData)
          .returning('*')
        activityLogPromise = ActivityLog.query().insert({
          userId: req.session.user.id,
          action: ActivityLog.actions.VALIDATE_DECLARATION,
        })
      }

      return Promise.all([declarationPromise, activityLogPromise]).then(
        ([dbDeclaration]) => res.json(dbDeclaration),
      )
    })
    .catch(next)
})

router.get('/files', (req, res, next) => {
  if (!req.query.declarationId || !req.query.name)
    return res.status(400).json('Missing parameters')

  return Declaration.query()
    .eager(
      '[trainingDocument, internshipDocument, sickLeaveDocument, maternityLeaveDocument, retirementDocument, invalidityDocument]',
    )
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
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.declarationId)
    return res.status(400).json('Missing declarationId')

  const userDocumentName = req.body.name

  const possibleDocumentTypes = [
    'trainingDocument',
    'internshipDocument',
    'sickLeaveDocument',
    'maternityLeaveDocument',
    'retirementDocument',
    'invalidityDocument',
  ]

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
        const documentFileObj = {
          file: req.file.filename,
        }

        const documentPromise = declaration[userDocumentName]
          ? declaration[userDocumentName].$query().patch(documentFileObj)
          : Document.query().insert(documentFileObj)

        return documentPromise
          .returning('*')
          .then((savedDocument) =>
            declaration
              .$query(trx)
              .patchAndFetch({ [`${userDocumentName}Id`]: savedDocument.id })
              .eager(`[${possibleDocumentTypes.join(', ')}]`),
          )
          .then((savedDeclaration) => res.json(savedDeclaration))
      }).catch(next)
    })
})

router.post('/finish', (req, res, next) =>
  Declaration.query()
    .eager('employers')
    .findOne({
      monthId: req.activeMonth.id,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Declaration not found')

      const hasMissingEmployersDocuments = declaration.employers.some(
        ({ documentId }) => !documentId,
      )
      const hasMissingDeclarationDocuments =
        (declaration.hasTrained && !declaration.trainingDocumentId) ||
        (declaration.hasInternship && !declaration.internshipDocumentId) ||
        (declaration.hasSickLeave && !declaration.sickLeaveDocumentId) ||
        (declaration.hasMaternityLeave &&
          !declaration.maternityLeaveDocumentId) ||
        (declaration.hasRetirement && !declaration.retirementDocumentId) ||
        (declaration.hasInvalidity && !declaration.invalidityDocumentId)

      if (
        declaration.employers.length === 0 ||
        hasMissingEmployersDocuments ||
        hasMissingDeclarationDocuments
      )
        return res.status(400).json('Declaration not complete')

      return Promise.all([
        declaration
          .$query()
          .patch({ isFinished: true })
          .returning('*'),
        ActivityLog.query().insert({
          userId: req.session.user.id,
          action: ActivityLog.actions.VALIDATE_FILES,
          metadata: JSON.stringify({ declarationId: declaration.id }),
        }),
      ]).then(([savedDeclaration]) => res.json(savedDeclaration))
    })
    .catch(next),
)

module.exports = router
