const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

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
        const dbEmployer = dbEmployers.find(({ id }) => id === employer.id)
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

module.exports = router
