/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-loop-func */

const { format } = require('date-fns');
const { get } = require('lodash');

exports.up = function up(knex) {
  return knex.schema
    .createTable('declaration_infos', (table) => {
      table.increments('id').primary();
      table
        .integer('declarationId')
        .notNull()
        .references('id')
        .inTable('declarations');
      table.string('type').notNull();
      table.date('startDate');
      table.date('endDate');
      table.string('file');
      table.bool('isTransmitted').defaultTo(false);
    })
    .then(() => knex.raw('SELECT * FROM declarations'))
    .then(async () => {
      const { rows: declarations } = await knex.raw(
        'SELECT * FROM declarations',
      );
      const { rows: declarationDocuments } = await knex.raw(
        'SELECT * FROM declaration_documents',
      );

      for (const declaration of declarations) {
        if (declaration.hasInternship) {
          const type = 'internship';
          for (const { startDate, endDate } of declaration.dates.internships) {
            const declarationDoc = declarationDocuments.find(
              ({ declarationId, type: declarationDocType }) =>
                declarationId === declaration.id && type === declarationDocType,
            );

            await knex.table('declaration_infos').insert(
              {
                type,
                declarationId: declaration.id,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                file: get(declarationDoc, 'file'),
                isTransmitted: get(declarationDoc, 'isTransmitted'),
              },
              ['id'],
            );
          }
        }
        if (declaration.hasSickLeave) {
          const type = 'sickLeave';
          for (const { startDate, endDate } of declaration.dates.sickLeaves) {
            const declarationDoc = declarationDocuments.find(
              ({ declarationId, type: declarationDocType }) =>
                declarationId === declaration.id && type === declarationDocType,
            );
            await knex.table('declaration_infos').insert(
              {
                type,
                declarationId: declaration.id,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                file: get(declarationDoc, 'file'),
                isTransmitted: get(declarationDoc, 'isTransmitted'),
              },
              ['id'],
            );
          }
        }

        if (declaration.hasMaternityLeave) {
          const type = 'maternityLeave';
          const declarationDoc = declarationDocuments.find(
            ({ declarationId, type: declarationDocType }) =>
              declarationId === declaration.id && type === declarationDocType,
          );
          await knex.table('declaration_infos').insert(
            {
              type,
              declarationId: declaration.id,
              startDate: format(
                declaration.dates.maternityLeave.startDate,
                'yyyy-MM-dd',
              ),
              file: get(declarationDoc, 'file'),
              isTransmitted: get(declarationDoc, 'isTransmitted'),
            },
            ['id'],
          );
        }

        if (declaration.hasRetirement) {
          const type = 'retirement';
          const declarationDoc = declarationDocuments.find(
            ({ declarationId, type: declarationDocType }) =>
              declarationId === declaration.id && type === declarationDocType,
          );
          await knex.table('declaration_infos').insert(
            {
              type,
              declarationId: declaration.id,
              startDate: format(
                declaration.dates.retirement.startDate,
                'yyyy-MM-dd',
              ),
              file: get(declarationDoc, 'file'),
              isTransmitted: get(declarationDoc, 'isTransmitted'),
            },
            ['id'],
          );
        }

        if (declaration.hasInvalidity) {
          const type = 'invalidity';
          const declarationDoc = declarationDocuments.find(
            ({ declarationId, type: declarationDocType }) =>
              declarationId === declaration.id && type === declarationDocType,
          );
          await knex.table('declaration_infos').insert(
            {
              type,
              declarationId: declaration.id,
              startDate: format(
                declaration.dates.invalidity.startDate,
                'yyyy-MM-dd',
              ),
              file: get(declarationDoc, 'file'),
              isTransmitted: get(declarationDoc, 'isTransmitted'),
            },
            ['id'],
          );
        }

        if (!declaration.isLookingForJob) {
          const type = 'jobSearch';
          await knex.table('declaration_infos').insert(
            {
              type,
              declarationId: declaration.id,
              endDate: format(
                declaration.dates.jobSearch.endDate,
                'yyyy-MM-dd',
              ),
            },
            ['id'],
          );
        }
      }
    })
    .then(() =>
      knex.schema.table('declarations', (table) => {
        table.dropColumn('dates');
      }))
    .then(() => knex.schema.dropTable('declaration_documents'));
};

exports.down = function down() {};
