/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('session')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex.schema.createTable('session', (table) => {
        table
          .string('sid')
          .notNullable()
          .primary()
        table.json('sess').notNullable()
        table.timestamp('expire').notNullable()
      })
    })
    .catch((err) => {
      if (err.done) return Promise.resolve()
      return Promise.reject(err)
    })
}

exports.down = function(knex, Promise) {}
