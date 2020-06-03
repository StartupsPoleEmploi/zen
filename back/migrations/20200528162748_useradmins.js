/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('useradmins')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex.schema.createTable('useradmins', (table) => {
        table.increments('id').primary();
        table.string('firstName', 128);
        table.string('lastName', 128);
        table.string('email', 128).notNullable();
        table.string('password', 128).notNullable();
        table.string('type', 128).notNullable().defaultTo('user');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());

        table.unique('email');
      })
    })
    .catch((err) => {
      if (err.done) return Promise.resolve()
      return Promise.reject(err)
    })
}

exports.down = function(knex, Promise) {}
