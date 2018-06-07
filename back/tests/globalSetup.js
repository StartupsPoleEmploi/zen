const Knex = require('knex')
const knexCleaner = require('knex-cleaner') // eslint-disable-line

const knex = Knex(require('../knexfile').test)

module.exports = () => knexCleaner.clean(knex)
