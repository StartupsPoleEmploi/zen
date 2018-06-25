const knex = require('./getKnexTestInstance')
const knexCleaner = require('knex-cleaner') // eslint-disable-line
const DeclarationMonth = require('../models/DeclarationMonth')
const { Model } = require('objection')

Model.knex(knex)

// Initial setup : Empty db (except potential migrations data)
// Then add a month in declaration months (will avoid putting it everywhere in the tests)
module.exports = () =>
  knex.migrate
    .latest()
    .then(() => knexCleaner.clean(knex, { ignoreTables: ['knex_migrations'] }))
    .then(() =>
      DeclarationMonth.query().insert({
        month: new Date('2018-05-01'),
        startDate: new Date('2018-05-28'),
        endDate: new Date('2018-06-15'),
      }),
    )
