/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('status', (table) => {
      table.boolean('up')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
    })
    .then(() =>
      knex('status').insert([
        {
          up: true,
        },
      ]),
    )
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('status')
}
