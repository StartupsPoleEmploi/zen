exports.up = async function(knex) {
  await knex.schema.table('Users', (table) => {
    table.string('agencyCode').defaultTo(false)
  })
}

exports.down = async function(knex) {
  knex.schema.table('Users', function(table) {
    table.string('agencyCode')
  })
}
