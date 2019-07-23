/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.date('lastDocsReminderDate')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('lastDocsReminderDate')
  })
}
