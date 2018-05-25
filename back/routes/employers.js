const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const multer = require('multer')
const path = require('path')

const uploadDestination =
  process.env.NODE_ENV === 'production' ? 'uploads/' : '/tmp/uploads/'

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb) {
      path.extname(file.originalname)
      cb(
        null,
        `${req.session.user.id}-${Date.now()}-${path.extname(
          file.originalname,
        )}`,
      )
    },
  }),
  fileFilter: function(req, file, callback) {
    const filetypes = /jpeg|jpg|png|pdf/i
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname))

    callback(null, mimetype && extname)
  },
  limits: {
    files: 1,
  },
})

const { Declaration, Employer } = require('../models')

const currentMonth = new Date('2018-05-01T00:00:00.000Z') // TODO handle other months later

router.get('/', (req, res) => {
  Declaration.find({
    where: {
      userId: req.session.user.id,
      declaredMonth: currentMonth,
    },
  }).then((declaration) => {
    if (!declaration) throw new Error('Please send declaration first')

    return Employer.findAll({
      where: {
        declarationId: declaration.id,
      },
      order: [['id']],
    }).then((employers) => res.json(employers))
  })
})

router.post('/', (req, res) => {
  const sentEmployers = req.body.employers || []
  if (!sentEmployers.length) return res.status(404).json('No data')

  Declaration.find({
    where: {
      userId: req.session.user.id,
      declaredMonth: currentMonth,
    },
  })
    .then((declaration) => {
      if (!declaration) throw new Error('Please send declaration first')

      return Employer.findAll({
        where: {
          declarationId: declaration.id,
        },
      }).then((employers) => ({ employers, declaration }))
    })
    .then(({ employers: dbEmployers, declaration }) => {
      const newEmployers = sentEmployers
        .filter((employer) => !employer.id)
        .map((employer) => ({
          ...employer,
          userId: req.session.user.id,
          declarationId: declaration.id,
          // Save temp data as much as possible
          workHours: isNaN(employer.workHours)
            ? null
            : employer.workHours || null,
          salary: isNaN(employer.salary) ? null : employer.salary || null,
        }))
      const updatedEmployers = sentEmployers.filter(({ id }) =>
        dbEmployers.some((employer) => employer.id === id),
      )
      const removedEmployersIds = dbEmployers
        .filter(
          ({ id }) => !sentEmployers.some((employer) => employer.id === id),
        )
        .map((employer) => employer.id)

      updatedEmployers.forEach((updatedEmployer) => {
        const dbEmployer = dbEmployers.find(
          ({ id }) => id === updatedEmployer.id,
        )
        if (!dbEmployer) return

        Object.assign(dbEmployer, updatedEmployer)
      })

      const createEmployersPromise =
        newEmployers.length > 0
          ? Employer.bulkCreate(newEmployers)
          : Promise.resolve()
      const deleteEmployersPromise =
        removedEmployersIds.length > 0
          ? Employer.destroy({
              where: {
                id: {
                  [Op.in]: removedEmployersIds,
                },
              },
            })
          : Promise.resolve()

      Promise.all([
        createEmployersPromise,
        Promise.all(dbEmployers.map((employer) => employer.save())),
        deleteEmployersPromise,
      ])
        .then(() =>
          Employer.findAll({
            where: {
              declarationId: declaration.id,
            },
          }),
        )
        .then((employers) => res.json(employers))
    })
})

router.get('/files', (req, res, next) => {
  if (!req.query.employerId) return res.status(400).json('Missing employerId')
  Employer.find({
    where: { id: req.query.employerId, userId: req.session.user.id },
  }).then((employer) => {
    if (!employer) return res.status(400).json('No such employer')
    if (!employer.file) return res.status(404).json('No such file')
    res.sendfile(employer.file, { root: uploadDestination })
  })
})

router.post('/files', upload.single('employerFile'), (req, res, next) => {
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.employerId) return res.status(400).json('Missing employerId')

  Employer.find({
    where: { id: req.body.employerId, userId: req.session.user.id },
  })
    .then((employer) => {
      if (!employer) return res.status(400).json('No such employer')

      employer.file = req.file.filename
      return employer.save().then(() => res.json(employer))
    })
    .catch(() => res.json(400).json('Error'))
})

module.exports = router
