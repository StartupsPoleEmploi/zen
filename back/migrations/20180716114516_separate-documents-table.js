/* eslint-disable */

exports.up = function(knex) {
  console.warn(
    `As this migration was created in a hurry, it will fail if there is data in the db,
    unless it is run from the exact commit from which it was created
    (this is because it uses models which have changed right after`,
  )
  const { Model, transaction } = require('objection')
  Model.knex(knex)

  const Declaration = require('../models/Declaration')
  const Document = require('../models/Document')
  const Employer = require('../models/Employer')

  return knex.schema
    .createTable('documents', (table) => {
      table.increments('id').primary()
      table.string('file').notNullable()
      table.boolean('isTransmitted').defaultTo(false)
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
    })
    .then(() => Declaration.query())
    .then((declarations) =>
      // Adding all entries that were before in Declaration
      transaction(knex, (trx) =>
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
                Document.query(trx)
                  .insert({ file: declaration[key] })
                  .returning('*'),
              ),
            ).then((fetchedResults) =>
              Promise.all(
                fetchedResults.map((result, key) =>
                  declaration
                    .$query(trx)
                    .patch({ [declarationFileKeys[key]]: result.id }),
                ),
              ),
            )
          }),
        )
          .then(() =>
            Employer.query(trx).then((employers) =>
              Promise.all(
                employers.map((employer) => {
                  if (!employer.file) return Promise.resolve()
                  return Document.query(trx)
                    .insert({ file: employer.file })
                    .returning('*')
                    .then((savedDocument) =>
                      employer.$query(trx).patch({ file: savedDocument.id }),
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
                  table
                    .foreign('trainingDocumentId')
                    .references('documents.id'),
                  table
                    .foreign('internshipDocumentId')
                    .references('documents.id'),
                  table
                    .foreign('sickLeaveDocumentId')
                    .references('documents.id'),
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
      ),
    )
}

exports.down = function(knex) {}
