exports.up = function(knex) {
  return knex.schema.table('declarations', (table) => {
    table.unique(['userId', 'monthId'])
  })
}

exports.down = function(knex) {
  return knex.schema.table('declarations', (table) => {
    table.dropUnique(['userId', 'monthId'])
  })
}
