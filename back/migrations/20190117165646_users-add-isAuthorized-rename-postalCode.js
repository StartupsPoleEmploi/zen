/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema
    .table('Users', (table) => {
      table.boolean('isAuthorized').defaultTo(false)
    })
    .then(() =>
      knex.raw(
        `UPDATE "Users" SET "isAuthorized"=true WHERE "peCode" IS NOT NULL AND "pePass" IS NOT NULL`,
      ),
    )
    .then(() =>
      knex.schema.table('Users', (table) => {
        table.renameColumn('pePostalCode', 'postalCode')
      }),
    )
}

exports.down = function(knex, Promise) {
  return knex.schema.table('Users', (table) => {
    table.dropColumn('isAuthorized')
    table.renameColumn('postalCode', 'pePostalCode')
  })
}
