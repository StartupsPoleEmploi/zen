/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

exports.up = function up(knex) {
  return knex.schema
    .table('declarations', (table) => {
      table.timestamp('transmittedAt');
      table.dropColumn('isTransmitted');
    })
    .then(() =>
      knex.raw('SELECT * FROM activity_logs where action=\'VALIDATE_EMPLOYERS\''))
    .then(async ({ rows: logs }) => {
      for (const i in logs) {
        if (!logs[i].metadata.declarationId) continue // eslint-disable-line

        await knex.raw(
          `UPDATE declarations set "transmittedAt"='${logs[
            i
          ].createdAt.toISOString()}' WHERE id=${
            logs[i].metadata.declarationId
          }`,
        );
      }
    });
};

exports.down = function down(knex) {
  return knex.schema.table('declarations', (table) => {
    table.dropColumn('transmittedAt');
    table.boolean('isTransmitted').defaultTo(false);
  });
};
