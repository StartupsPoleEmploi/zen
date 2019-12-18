exports.up = async function(knex) {
  await knex.schema.table('Users', (table) => {
    table.string('agencyCode').defaultTo(null)
  })
}

exports.down = async function(knex) {
  knex.schema.table('Users', function(table) {
    table.dropColumn('agencyCode')
  })
}
