const express = require('express')

const router = express.Router()
const { omit } = require('lodash')

const { upload, uploadDestination } = require('../lib/upload')
const Declaration = require('../models/Declaration')

const declaredMonth = '2018-05-01' // TODO handle other months later

router.get('/', (req, res) => {
  if (!('last' in req.query)) return res.status(400).json('Route not ready')

  Declaration.query()
    .findOne({
      declaredMonth,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')
      res.json(declaration)
    })
})

router.post('/', (req, res, next) => {
  const declarationData = omit(
    {
      ...req.body,
      userId: req.session.user.id,
      declaredMonth,
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
      if (declaration) {
        declarationData.id = declaration.id
      }

      return Declaration.query()
        .upsertGraph(declarationData)
        .then(() => res.json(declarationData))
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
      if (!declaration) return res.status(400).json('No such declaration')
      if (!declaration[req.query.name]) {
        return res.status(404).json('No such file')
      }

      res.sendfile(declaration[req.query.name], { root: uploadDestination })
    })
})

router.post('/files', upload.single('document'), (req, res, next) => {
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.declarationId)
    return res.status(400).json('Missing declarationId')
  if (!req.body.name) return res.status(400)

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
      declaredMonth,
      userId: req.session.user.id,
    })
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Declaration not found')

      if (
        declaration.employers.length === 0 ||
        declaration.employers.some(({ file }) => !file)
      )
        return res.status(400).json('Declaration not complete')

      return declaration
        .$query()
        .patch({ isFinished: true })
        .then(() => res.json(declaration))
    })
    .catch(next)
})

module.exports = router
