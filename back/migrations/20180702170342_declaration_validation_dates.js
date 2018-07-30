/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .table('Declarations', (table) =>
      table.timestamp('employersDeclarationDate').defaultTo(null),
    )
    .then(() =>
      knex.raw(`
        UPDATE "Declarations" SET "employersDeclarationDate"=now() WHERE "hasFinishedDeclaringEmployers"=true;
      `),
    )
    .then(() =>
      knex.schema.table('Declarations', (table) =>
        table.dropColumn('hasFinishedDeclaringEmployers'),
      ),
    )
}

exports.down = function(knex) {
  return knex.schema
    .table('Declarations', (table) =>
      table.boolean('hasFinishedDeclaringEmployers'),
    )
    .then(() =>
      knex.raw(`
        UPDATE "Declarations" SET "hasFinishedDeclaringEmployers"=true WHERE "employersDeclarationDate" IS NOT NULL;
      `),
    )
    .then(() =>
      knex.schema.table('Declarations', (table) =>
        table.dropColumn('employersDeclarationDate'),
      ),
    )
}
