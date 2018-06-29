const express = require('express')

const router = express.Router()
const { transaction } = require('objection')

const { upload, uploadDestination } = require('../lib/upload')
const Declaration = require('../models/Declaration')
const Employer = require('../models/Employer')
const ActivityLog = require('../models/ActivityLog')

const getSanitizedEmployer = ({ employer, declaration, user }) => {
  const intWorkHours = parseInt(employer.workHours, 10)
  const intSalary = parseInt(employer.salary, 10)

  return {
    ...employer,
    userId: user.id,
    declarationId: declaration.id,
    // Save temp data as much as possible
    workHours: !Number.isNaN(intWorkHours) ? intWorkHours : null,
    salary: !Number.isNaN(intSalary) ? intSalary : null,
  }
}

router.get('/', (req, res, next) => {
  Declaration.query()
    .eager('employers')
    .findOne({
      userId: req.session.user.id,
      monthId: req.activeMonth.id,
    })
    .then((declaration) => {
      if (!declaration) {
        return res.status(404).json('No declaration found')
      }

      res.json(declaration.employers)
    })
    .catch(next)
})

router.post('/', (req, res, next) => {
  const sentEmployers = req.body.employers || []
  if (!sentEmployers.length) return res.status(400).json('No data')

  Declaration.query()
    .eager('employers')
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
      if (req.body.isFinished) {
        declaration.hasFinishedDeclaringEmployers = true
      }

      return transaction(Declaration.knex(), (trx) =>
        Promise.all([
          declaration.$query(trx).upsertGraph(),
          shouldLog
            ? ActivityLog.query(trx).insert({
                userId: req.session.user.id,
                action: ActivityLog.actions.VALIDATE_EMPLOYERS,
                metadata: JSON.stringify({ declarationId: declaration.id }),
              })
            : Promise.resolve(),
        ]),
      ).then(() => res.json(declaration.employers))
    })
    .catch(next)
})

router.get('/files', (req, res) => {
  if (!req.query.employerId) return res.status(400).json('Missing employerId')
  Employer.query()
    .findOne({
      id: req.query.employerId,
      userId: req.session.user.id,
    })
    .then((employer) => {
      if (!employer) return res.status(404).json('No such employer')
      if (!employer.file) return res.status(404).json('No such file')
      res.sendFile(employer.file, { root: uploadDestination })
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
      if (!employer) return res.status(404).json('No such employer')

      employer.file = req.file.filename

      return employer
        .$query()
        .update()
        .returning('*')
        .then((updatedEmployer) => res.json(updatedEmployer))
    })
    .catch(next)
})

module.exports = router

// Make sure the person has the correct id because `upsertGraph` uses the id fields
// to determine which models need to be updated and which inserted.
