exports.up = async function(knex) {
  await knex.schema.table('Users', (table) => {
    table
      .boolean('isActuDone')
      .defaultTo(false)
      .notNullable()
  })
}

exports.down = async function(knex) {
  knex.schema.table('Users', function(table) {
    table.dropColumn('isActuDone')
  })
}
