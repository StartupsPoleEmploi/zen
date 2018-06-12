const knex = require('./getKnexTestInstance')
const knexCleaner = require('knex-cleaner') // eslint-disable-line

module.exports = () => knex.migrate.latest().then(() => knexCleaner.clean(knex))
