/* eslint-disable */

exports.up = function(knex) {
  return (
    knex.schema
      .table('Declarations', (table) => {
        table.boolean('isEmailSent').defaultTo(false)
        table.boolean('isDocEmailSent').defaultTo(false)
      })
      // naive, but OK for initialization
      .then(() =>
        knex.raw(
          'UPDATE "Declarations" SET "isEmailSent"=true WHERE "isTransmitted"=true',
        ),
      )
      .then(() =>
        knex.raw(
          'UPDATE "Declarations" SET "isDocEmailSent"=true WHERE "isFinished"=true',
        ),
      )
  )
}

exports.down = function(knex) {
  return knex.schema.table('Declarations', (table) => {
    table.dropColumn('isEmailSent')
    table.dropColumn('isDocEmailSent')
  })
}
