const { Model } = require('objection')
const Knex = require('knex')
const pg = require('pg')

/* https://github.com/tgriesser/knex/issues/927
 * This tells node-pg to use float type for decimal
 * which it does not do because JS loses precision on
 * big decimal number.
 * For our usage (salary), this is not an issue.
 */
const PG_DECIMAL_OID = 1700
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat)

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

// the export is only useful for tests, for other cases
// the knex instance can be obtained via objection.
module.exports = knex
