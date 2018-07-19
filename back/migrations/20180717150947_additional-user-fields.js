/* eslint-disable */

exports.up = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.string('peCode')
    table.string('pePass')
    table.string('pePostalCode')
  })
}

exports.down = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('peCode')
    table.dropColumn('pePass')
    table.dropColumn('pePostalCode')
  })
}
