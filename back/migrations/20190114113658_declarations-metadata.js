/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.table('Declarations', function(table) {
    table.json('metadata').defaultTo('{}')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('Declarations', function(table) {
    table.dropColumn('metadata')
  })
}
