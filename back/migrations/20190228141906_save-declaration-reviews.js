/* eslint-disable */

const { isBoolean } = require('lodash')

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('declaration_reviews', (table) => {
      table.increments('id').primary()
      table
        .integer('declarationId')
        .notNull()
        .references('id')
        .inTable('declarations')
      table.boolean('isVerified')
      table.string('notes')
    })
    .then(() =>
      knex
        .raw(`SELECT * FROM "declarations"`)
        .then(async ({ rows: declarations }) => {
          for (const i in declarations) {
            if (
              !declarations[i].metadata ||
              (!isBoolean(declarations[i].metadata.isVerified) &&
                !declarations[i].metadata.notes)
            ) {
              continue
            }

            await knex.table('declaration_reviews').insert({
              declarationId: declarations[i].id,
              isVerified: !!declarations[i].metadata.isVerified,
              notes: declarations[i].metadata.notes,
            })
          }
        }),
    )
    .then(() =>
      knex.schema.table('declarations', (table) => {
        table.dropColumn('metadata')
      }),
    )
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('declaration_reviews').then(() =>
    knex.schema.table('declarations', (table) => {
      table.json('metadata')
    }),
  )
}
