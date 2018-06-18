/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.createTable('administrators', (table) => {
    table.increments('id').primary()
    table.string('name')
    table.string('password')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('administrators')
}
