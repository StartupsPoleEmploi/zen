/* eslint-disable */

exports.up = function(knex) {
  /*
    WARNING
    `This migration was first done stupidly and also migrated data using models.
    It has been updated to use knex.raw, but the data migration hasn't been verified
    as there is no more reason to have data migrated (at the time of writing, this migration is already
    6 months old, so the only reason to run it again is to recreate the project from scratch,
    supposedly with no data).
    TL;DR: If this fails, empty your development db.`,
  */

  return knex.schema
    .createTable('documents', (table) => {
      table.increments('id').primary()
      table.string('file').notNullable()
      table.boolean('isTransmitted').defaultTo(false)
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
    })
    .then(() => knex.raw('SELECT * FROM "Declarations"'))
    .then(({ rows: declarations }) =>
      // Adding all entries that were before in Declaration
      Promise.all(
        declarations.map((declaration) => {
          const declarationFileKeys = [
            'trainingDocument',
            'internshipDocument',
            'sickLeaveDocument',
            'maternityLeaveDocument',
            'retirementDocument',
            'invalidityDocument',
          ].filter((key) => declaration[key])

          return Promise.all(
            declarationFileKeys.map((key) =>
              knex.raw(
                `INSERT INTO documents (file) VALUES '${
                  declaration[key]
                }' RETURNING *`,
              ),
            ),
          ).then((fetchedResults) =>
            Promise.all(
              fetchedResults.map((result, key) =>
                knex.raw(
                  `UPDATE "declarations" SET "${declarationFileKeys[key]}"=${
                    result.id
                  } WHERE id=${declaration.id}`,
                ),
              ),
            ),
          )
        }),
      )
        .then(() =>
          knex.raw('SELECT * FROM "Employers"').then(({ rows: employers }) =>
            Promise.all(
              employers.map((employer) => {
                if (!employer.file) return Promise.resolve()
                return knex
                  .raw(
                    `INSERT INTO "documents" (file) VALUES '${
                      employer.file
                    } RETURNING *`,
                  )
                  .then(({ rows: savedDocuments }) =>
                    knex.raw(
                      `UPDATE "employers" SET "file"=${
                        savedDocuments[0].id
                      } WHERE id=${employer.id}`,
                    ),
                  )
              }),
            ),
          ),
        )
        .then(() =>
          knex.schema
            .table('Declarations', (table) => {
              table.renameColumn('trainingDocument', 'trainingDocumentId')
              table.renameColumn('internshipDocument', 'internshipDocumentId')
              table.renameColumn('sickLeaveDocument', 'sickLeaveDocumentId')
              table.renameColumn(
                'maternityLeaveDocument',
                'maternityLeaveDocumentId',
              )
              table.renameColumn('retirementDocument', 'retirementDocumentId')
              table.renameColumn('invalidityDocument', 'invalidityDocumentId')
            })
            .then(() =>
              knex.schema.table('Declarations', (table) => {
                table.integer('trainingDocumentId').alter()
                table.integer('internshipDocumentId').alter()
                table.integer('sickLeaveDocumentId').alter()
                table.integer('maternityLeaveDocumentId').alter()
                table.integer('retirementDocumentId').alter()
                table.integer('invalidityDocumentId').alter()
              }),
            )
            .then(() =>
              knex.schema.table('Employers', (table) => {
                table.renameColumn('file', 'documentId')
              }),
            )
            .then(() =>
              knex.schema.table('Employers', (table) => {
                table.integer('documentId').alter()
              }),
            ),
        )
        .then(() =>
          Promise.all([
            knex.schema.table('Declarations', (table) =>
              Promise.all([
                table.foreign('trainingDocumentId').references('documents.id'),
                table
                  .foreign('internshipDocumentId')
                  .references('documents.id'),
                table.foreign('sickLeaveDocumentId').references('documents.id'),
                table
                  .foreign('maternityLeaveDocumentId')
                  .references('documents.id'),
                table
                  .foreign('retirementDocumentId')
                  .references('documents.id'),
                table
                  .foreign('invalidityDocumentId')
                  .references('documents.id'),
              ]),
            ),
            knex.schema.table('Employers', (table) =>
              table.foreign('documentId').references('documents.id'),
            ),
          ]),
        ),
    )
}

exports.down = function(knex) {}
