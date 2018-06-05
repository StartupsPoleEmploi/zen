/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('Declarations')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex.schema.createTable('Declarations', (table) => {
        table.increments('id').primary()
        table.integer('userId').notNullable()
        table.date('declaredMonth').notNullable()
        table.boolean('hasWorked').notNullable()
        table.boolean('hasTrained').notNullable()
        table.date('trainingStartDate')
        table.date('trainingEndDate')
        table.string('trainingDocument')
        table.boolean('hasInternship').notNullable()
        table.date('internshipStartDate')
        table.date('internshipEndDate')
        table.string('internshipDocument')
        table.boolean('hasSickLeave').notNullable()
        table.date('sickLeaveStartDate')
        table.date('sickLeaveEndDate')
        table.string('sickLeaveDocument')
        table.boolean('hasMaternityLeave').notNullable()
        table.date('maternityLeaveStartDate')
        table.string('maternityLeaveDocument')
        table.boolean('hasRetirement').notNullable()
        table.date('retirementStartDate')
        table.string('retirementDocument')
        table.boolean('hasInvalidity').notNullable()
        table.date('invalidityStartDate')
        table.string('invalidityDocument')
        table.boolean('isLookingForJob').notNullable()
        table.date('jobSearchEndDate')
        table.string('jobSearchStopMotive')
        table.boolean('hasFinishedDeclaringEmployers').defaultTo(false)
        table.boolean('isFinished').defaultTo(false)
        table.timestamp('createdAt').defaultTo(knex.fn.now())
        table.timestamp('updatedAt').defaultTo(knex.fn.now())

        table.foreign('userId').references('Users.id')
        table.index('userId')
        table.index('declaredMonth')
        table.unique(['userId', 'declaredMonth'])
      })
    })
    .catch((err) => {
      if (err.done) return Promise.resolve()
      return Promise.reject(err)
    })
}

exports.down = function(knex, Promise) {}
