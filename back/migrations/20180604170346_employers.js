/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('Employers')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex.schema.createTable('Employers', (table) => {
        table.increments('id').primary()
        table.integer('userId').notNullable()
        table.integer('declarationId')
        table.string('employerName')
        table.integer('workHours')
        table.integer('salary')
        table.boolean('hasEndedThisMonth')
        table.string('file')
        table.timestamp('createdAt').defaultTo(knex.fn.now())
        table.timestamp('updatedAt').defaultTo(knex.fn.now())

        table.index('userId')
        table.index('declarationId')
        table.foreign('userId').references('Users.id')
        table.foreign('declarationId').references('Declarations.id')
      })
    })
    .catch((err) => {
      if (err.done) return Promise.resolve()
      return Promise.reject(err)
    })
}

exports.down = function(knex, Promise) {}
