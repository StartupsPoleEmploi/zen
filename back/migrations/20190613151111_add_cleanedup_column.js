/* eslint-disable */
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('declarations', (table) => {
      table.boolean('isCleanedUp').defaultTo(false)
    }),
    knex.schema.table('declaration_infos', (table) => {
      table.boolean('isCleanedUp').defaultTo(false)
    }),
    knex.schema.table('employer_documents', (table) => {
      table.boolean('isCleanedUp').defaultTo(false)
    }),
  ])
}

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('declarations', (table) => {
      table.dropColumn('isCleanedUp')
    }),
    knex.schema.table('declaration_infos', (table) => {
      table.dropColumn('isCleanedUp')
    }),
    knex.schema.table('employer_documents', (table) => {
      table.dropColumn('isCleanedUp')
    }),
  ])
}
