const knex = require('./getKnexTestInstance')
const { Model } = require('objection')

Model.knex(knex)

const pg = require('pg')

/* https://github.com/tgriesser/knex/issues/927
 * This tells node-pg to use float type for decimal
 * which it does not do because JS loses precision on
 * big decimal number.
 * For our usage (salary), this is not an issue.
 * This setup is also in app.js
 */
const PG_DECIMAL_OID = 1700
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat)
