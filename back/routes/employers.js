const express = require('express')
const router = express.Router()
const { transaction } = require('objection')

const { upload, uploadDestination } = require('../lib/upload')
const Declaration = require('../models/Declaration')
const Employer = require('../models/Employer')

const currentMonth = new Date('2018-05-01T00:00:00.000Z') // TODO handle other months later

router.get('/', (req, res) => {
  Declaration.query()
    .eager('employers')
    .findOne({
      userId: req.session.user.id,
      declaredMonth: currentMonth,
    })
    .then((declaration) => {
      if (!declaration) throw new Error('Please send declaration first')

      res.json(declaration.employers)
    })
})

router.post('/', (req, res) => {
  const sentEmployers = req.body.employers || []
  if (!sentEmployers.length) return res.status(404).json('No data')

  const isEmployersDeclarationFinished = !!req.body.isFinished

  Declaration.query()
    .eager('employers')
    .findOne({
      userId: req.session.user.id,
      declaredMonth: currentMonth,
    })
    .then((declaration) => {
      if (!declaration) throw new Error('Please send declaration first')

      const newEmployers = sentEmployers
        .filter((employer) => !employer.id)
        .map((employer) => ({
          ...employer,
          userId: req.session.user.id,
          declarationId: declaration.id,
          // Save temp data as much as possible
          workHours: isNaN(employer.workHours)
            ? null
            : parseInt(employer.workHours, 10) || null,
          salary: isNaN(employer.salary)
            ? null
            : parseInt(employer.salary, 10) || null,
        }))
      const updatedEmployers = sentEmployers.filter(({ id }) =>
        declaration.employers.some((employer) => employer.id === id),
      )

      declaration.hasFinishedDeclaringEmployers = true
      declaration.employers = newEmployers.concat(updatedEmployers)

      transaction(Declaration.knex(), (trx) =>
        declaration.$query(trx).upsertGraph(),
      ).then((declaration) => res.json(declaration.employers))
    })
})

router.get('/files', (req, res, next) => {
  if (!req.query.employerId) return res.status(400).json('Missing employerId')
  Employer.query()
    .findOne({
      id: req.query.employerId,
      userId: req.session.user.id,
    })
    .then((employer) => {
      if (!employer) return res.status(400).json('No such employer')
      if (!employer.file) return res.status(404).json('No such file')
      res.sendfile(employer.file, { root: uploadDestination })
    })
})

router.post('/files', upload.single('employerFile'), (req, res, next) => {
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.employerId) return res.status(400).json('Missing employerId')

  Employer.query()
    .findOne({
      id: req.body.employerId,
      userId: req.session.user.id,
    })
    .then((employer) => {
      if (!employer) return res.status(400).json('No such employer')

      employer.file = req.file.filename

      return employer
        .$query()
        .update()
        .returning('*')
        .then((employer) => res.json(employer))
    })
    .catch((err) => next(err))
})

module.exports = router

// Make sure the person has the correct id because `upsertGraph` uses the id fields
// to determine which models need to be updated and which inserted.
