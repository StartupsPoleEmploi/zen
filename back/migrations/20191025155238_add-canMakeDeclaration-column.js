/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.boolean('canMakeMonthDeclaration').defaultTo(true)
    table.boolean('canMakeDeclaration').defaultTo(true)
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('canMakeMonthDeclaration')
    table.dropColumn('canMakeDeclaration')
  })
}
