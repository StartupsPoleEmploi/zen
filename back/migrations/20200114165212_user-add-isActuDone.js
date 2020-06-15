exports.up = async function up(knex) {
  await knex.schema.table('Users', (table) => {
    table
      .boolean('isActuDone')
      .defaultTo(false)
      .notNullable();
  });
};

exports.down = async function down(knex) {
  knex.schema.table('Users', (table) => {
    table.dropColumn('isActuDone');
  });
};
