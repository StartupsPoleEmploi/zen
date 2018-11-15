/* eslint-disable */

exports.up = function(knex) {
  return knex.schema.table('Declarations', (table) => {
    table.dropColumn('trainingStartDate')
    table.dropColumn('trainingEndDate')
    table.dropColumn('trainingDocumentId')
  })
}

exports.down = function(knex) {
  return knex.schema.table('Declarations', (table) => {
    table.date('trainingStartDate')
    table.date('trainingEndDate')
    table.integer('trainingDocumentId')
  })
}
