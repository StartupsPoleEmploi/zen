/* eslint-disable */

exports.up = function(knex, Promise) {
  return knex.schema.table('Employers', (table) => {
    // parameters for decimal are precision (max total numbers in the number)
    // and scale (max numbers after the comma)
    table.decimal('salary', 7, 2).alter()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('Employers', (table) => {
    table.integer('salary').alter()
  })
}
