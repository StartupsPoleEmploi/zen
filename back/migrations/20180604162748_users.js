/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('Users')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex.schema.createTable('Users', (table) => {
        table.increments('id').primary()
        table
          .string('peId', 100)
          .notNullable()
          .unique()
        table.string('firstName', 85).notNullable()
        table.string('lastName', 30).notNullable()
        table.string('email', 60)
        table.timestamp('createdAt').defaultTo(knex.fn.now())
        table.timestamp('updatedAt').defaultTo(knex.fn.now())
      })
    })
    .catch((err) => {
      if (err.done) return Promise.resolve()
      return Promise.reject(err)
    })
}

exports.down = function(knex, Promise) {}
