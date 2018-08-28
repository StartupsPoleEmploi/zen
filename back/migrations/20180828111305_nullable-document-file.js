/* eslint-disable */

exports.up = function(knex, Promise) {
  return knex.schema.table('documents', (table) => {
    table
      .string('file')
      .nullable()
      .alter()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('documents', (table) => {
    table
      .string('file')
      .notNullable()
      .alter()
  })
}
