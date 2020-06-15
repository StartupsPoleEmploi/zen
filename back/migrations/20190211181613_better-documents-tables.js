/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

exports.up = function up(knex) {
  return knex.schema
    .renameTable('Employers', 'employers')
    .then(() =>
      knex.schema.table('documents', (table) => {
        table.string('type');
        table
          .integer('employerId')
          .references('id')
          .inTable('employers');
      }))
    .then(() =>
      knex.raw(
        'UPDATE documents set "type"=\'salarySheet\' where id IN (select "documentId" from "employers" WHERE "documentId" IS NOT NULL AND "hasEndedThisMonth"=false);',
      ))
    .then(() =>
      knex.raw(
        'UPDATE documents set "type"=\'employerCertificate\' where id IN (select "documentId" from "employers" WHERE "documentId" IS NOT NULL AND "hasEndedThisMonth"=true);',
      ))
    .then(() =>
      knex
        .raw('SELECT * FROM "employers" WHERE "documentId" IS NOT NULL')
        .then(async ({ rows: employers }) => {
          for (const i in employers) {
            await knex.raw(
              `UPDATE documents set "employerId"=${employers[i].id} WHERE id=${
                employers[i].documentId
              }`,
            );
          }
        }))
    .then(() =>
      knex.schema.createTable('declaration_documents', (table) => {
        table.increments('id').primary();
        table.string('type');
        table
          .integer('declarationId')
          .notNull()
          .references('id')
          .inTable('declarations');
        table.string('file');
        table.boolean('isTransmitted').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
      }))
    .then(() =>
      knex.raw(
        'INSERT INTO declaration_documents (type, "declarationId", file, "isTransmitted") SELECT \'sickLeave\', declarations.id, file, documents."isTransmitted" FROM declarations INNER JOIN documents ON declarations."sickLeaveDocumentId"=documents.id WHERE "sickLeaveDocumentId" IS NOT NULL',
      ))
    .then(() =>
      // First drop foreign so we can still require sickLeaveDocumentId in next query, then remove it
      knex.schema.table('declarations', (table) => {
        table.dropForeign('internshipDocumentId');
        table.dropForeign('sickLeaveDocumentId');
        table.dropForeign('maternityLeaveDocumentId');
        table.dropForeign('retirementDocumentId');
        table.dropForeign('invalidityDocumentId');
      }))
    .then(() =>
      knex.schema.table('employers', (table) => {
        table.dropColumn('documentId');
      }))
    .then(() =>
      knex.raw(
        'DELETE FROM "documents" WHERE id IN (SELECT "sickLeaveDocumentId" FROM declarations WHERE "sickLeaveDocumentId" IS NOT NULL)',
      ))
    .then(() =>
      knex.schema.table('declarations', (table) => {
        table.dropColumn('internshipDocumentId');
        table.dropColumn('sickLeaveDocumentId');
        table.dropColumn('maternityLeaveDocumentId');
        table.dropColumn('retirementDocumentId');
        table.dropColumn('invalidityDocumentId');
      }))
    .then(() => knex.raw('DELETE FROM "documents" WHERE "type" IS NULL'))
    .then(() => knex.schema.renameTable('documents', 'employer_documents'))
    .then(() =>
      knex.schema.table('employer_documents', (table) => {
        table
          .integer('employerId')
          .notNull()
          .references('id')
          .inTable('employers')
          .alter();
      }));

  /*
    There are too few of the remaining options to be worth handling here, handle manually then
    migrate to NOT NULL for type
    */
};

exports.down = function down(knex) {
  return knex.schema
    .renameTable('employers', 'Employers')
    .then(() => knex.schema.renameTable('employer_documents', 'documents'))
    .then(() =>
      knex.schema.table('documents', (table) => {
        table.dropColumn('employerId');
        table.dropColumn('type');
      }))
    .then(() =>
      knex.schema.table('declarations', (table) => {
        table
          .integer('trainingDocumentId')
          .references('id')
          .inTable('documents');
        table
          .integer('internshipDocumentId')
          .references('id')
          .inTable('documents');
        table
          .integer('sickLeaveDocumentId')
          .references('id')
          .inTable('documents');
        table
          .integer('maternityLeaveDocumentId')
          .references('id')
          .inTable('documents');
        table
          .integer('retirementDocumentId')
          .references('id')
          .inTable('documents');
        table
          .integer('invalidityDocumentId')
          .references('id')
          .inTable('documents');
      }))
    .then(() =>
      knex.schema.table('Employers', (table) => {
        table
          .integer('documentId')
          .references('id')
          .inTable('documents');
      }))
    .then(() => knex.schema.dropTable('declaration_documents'));
};
