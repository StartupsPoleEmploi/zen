/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.createTable('activity_logs', (table) => {
    table.increments('id').primary()
    table.integer('userId').notNullable()
    table.string('action').notNullable()
    table.timestamp('createdAt').defaultTo(knex.fn.now())

    table.foreign('userId').references('Users.id')
    table.index('userId')
    table.index('createdAt')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('activity_logs')
}
