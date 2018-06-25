const express = require('express')

const router = express.Router()
const { omit } = require('lodash')

const { upload, uploadDestination } = require('../lib/upload')
const Declaration = require('../models/Declaration')
const ActivityLog = require('../models/ActivityLog')

router.get('/', (req, res) => {
  if (!('last' in req.query)) return res.status(400).json('Route not ready')

  Declaration.query()
    .findOne({
      monthId: req.activeMonth.id,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')
      res.json(declaration)
    })
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
      let activityLogPromise = Promise.resolve()
      if (declaration) {
        declarationData.id = declaration.id
      } else {
        activityLogPromise = ActivityLog.query().insert({
          userId: req.session.user.id,
          action: ActivityLog.actions.VALIDATE_DECLARATION,
        })
      }

      return Promise.all([
        Declaration.query().upsertGraphAndFetch(declarationData),
        activityLogPromise,
      ]).then(([dbDeclaration]) => res.json(dbDeclaration))
    })
    .catch(next)
})

router.get('/files', (req, res) => {
  if (!req.query.declarationId || !req.query.name)
    return res.status(400).json('Missing parameters')
  Declaration.query()
    .findOne({
      id: req.query.declarationId,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')
      if (!declaration[req.query.name]) {
        return res.status(404).json('No such file')
      }

      res.sendFile(declaration[req.query.name], { root: uploadDestination })
    })
})

router.post('/files', upload.single('document'), (req, res, next) => {
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.declarationId)
    return res.status(400).json('Missing declarationId')
  if (!req.body.name) return res.status(400).json('Missing document name')

  Declaration.query()
    .findOne({
      id: req.body.declarationId,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(400).json('No such declaration')

      return declaration
        .$query()
        .patch({
          [req.body.name]: req.file.filename,
        })
        .then(() => res.json(declaration))
    })
    .catch(next)
})

router.post('/finish', (req, res, next) => {
  Declaration.query()
    .eager('employers')
    .findOne({
      monthId: req.activeMonth.id,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Declaration not found')

      if (
        declaration.employers.length === 0 ||
        declaration.employers.some(({ file }) => !file)
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
    .catch(next)
})

module.exports = router
