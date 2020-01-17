/* eslint-disable */
exports.up = async function(knex) {
  await knex.schema.table('status', (table) => {
    table
      .boolean('isFilesServiceUp')
      .default(true)
      .notNullable()
  })
}

exports.down = async function(knex) {
  knex.schema.table('status', function(table) {
    table.dropColumn('isFilesServiceUp')
  })
}
