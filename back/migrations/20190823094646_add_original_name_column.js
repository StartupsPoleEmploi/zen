/* eslint-disable */
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('declaration_infos', (table) => {
      table.string('originalFileName')
    }),
    knex.schema.table('employer_documents', (table) => {
      table.string('originalFileName')
    }),
  ])
}

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('declaration_infos', (table) => {
      table.dropColumn('originalFileName')
    }),
    knex.schema.table('employer_documents', (table) => {
      table.dropColumn('originalFileName')
    }),
  ])
}
