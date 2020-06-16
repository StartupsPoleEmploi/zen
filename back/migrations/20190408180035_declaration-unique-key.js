exports.up = function up(knex) {
  return knex.schema.table('declarations', (table) => {
    table.unique(['userId', 'monthId']);
  });
};

exports.down = function down(knex) {
  return knex.schema.table('declarations', (table) => {
    table.dropUnique(['userId', 'monthId']);
  });
};
