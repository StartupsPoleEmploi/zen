/* eslint-disable */

exports.up = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.string('gender')
  })
}

exports.down = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('gender')
  })
}
