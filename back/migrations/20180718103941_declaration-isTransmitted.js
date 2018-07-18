/* eslint-disable */

exports.up = function(knex) {
  return knex.schema.table('Declarations', (table) => {
    table.boolean('isTransmitted').defaultTo(false)
  })
}

exports.down = function(knex) {
  return knex.schema.table('Declarations', (table) => {
    table.boolean('isTransmitted')
  })
}
