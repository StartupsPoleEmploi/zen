/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .table('Users', (table) => {
      table.boolean('needEmployerOnBoarding').defaultTo(true)
    })
    .then(() =>
      knex.raw(
        'UPDATE "Users" SET "needEmployerOnBoarding"=false WHERE id IN (SELECT DISTINCT "userId" FROM declarations)',
      ),
    )
}

exports.down = function(knex) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('needEmployerOnBoarding')
  })
}
