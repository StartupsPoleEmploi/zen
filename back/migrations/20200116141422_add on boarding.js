/* eslint-disable */
exports.up = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.boolean('needOnBoarding').defaultTo(true)
  })
}

exports.down = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('needOnBoarding')
  })
}
