/* eslint-disable */

exports.up = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('peCode')
    table.dropColumn('pePass')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.string('peCode')
    table.string('pePass')
  })
}
