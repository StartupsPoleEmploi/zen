/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('conseillers_help_query')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex.schema.createTable('conseillers_help_query', (table) => {
        table.increments('id').primary()
        table.string('email', 250)
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
