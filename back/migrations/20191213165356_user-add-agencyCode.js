exports.up = async function up(knex) {
  await knex.schema.table('Users', (table) => {
    table.string('agencyCode').defaultTo(null);
  });
};

exports.down = async function down(knex) {
  knex.schema.table('Users', (table) => {
    table.dropColumn('agencyCode');
  });
};
