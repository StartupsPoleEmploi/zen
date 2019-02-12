/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

const { get } = require('lodash')
const { addDays } = require('date-fns')

exports.up = function(knex) {
  return knex.schema.renameTable('Declarations', 'declarations').then(() =>
    knex.schema
      .table('declarations', (table) => {
        table.json('dates').defaultTo('{}')
      })
      .then(() =>
        knex
          .raw(`SELECT * FROM "declarations"`)
          .then(async ({ rows: declarations }) => {
            for (const i in declarations) {
              const dates = {}
              if (declarations[i].hasSickLeave) {
                dates.sickLeave = [
                  {
                    startDate: declarations[i].sickLeaveStartDate,
                    endDate: declarations[i].sickLeaveEndDate,
                  },
                ]
              }

              if (declarations[i].hasInternship) {
                dates.internship = [
                  {
                    startDate: declarations[i].internshipStartDate,
                    endDate: declarations[i].internshipEndDate,
                  },
                ]
              }

              if (declarations[i].hasMaternityLeave) {
                dates.maternityLeave = [
                  {
                    startDate: declarations[i].maternityLeaveStartDate,
                  },
                ]
              }

              if (declarations[i].hasRetirement) {
                dates.retirement = [
                  {
                    startDate: declarations[i].retirementStartDate,
                  },
                ]
              }

              if (declarations[i].hasInvalidity) {
                dates.invalidity = [
                  {
                    startDate: declarations[i].invalidityStartDate,
                  },
                ]
              }

              if (!declarations[i].isLookingForJob) {
                dates.jobSearch = [
                  {
                    endDate: declarations[i].jobSearchEndDate,
                  },
                ]
              }

              await knex.raw(
                `UPDATE declarations set "dates"='${JSON.stringify(
                  dates,
                )}' WHERE id=${declarations[i].id}`,
              )
            }
          }),
      )
      .then(() =>
        knex.schema.table('declarations', (table) => {
          table.dropColumn('internshipStartDate')
          table.dropColumn('internshipEndDate')
          table.dropColumn('sickLeaveStartDate')
          table.dropColumn('sickLeaveEndDate')
          table.dropColumn('maternityLeaveStartDate')
          table.dropColumn('retirementStartDate')
          table.dropColumn('invalidityStartDate')
          table.dropColumn('jobSearchEndDate')
        }),
      ),
  )
}

exports.down = function(knex) {
  return knex.schema
    .table('declarations', (table) => {
      table.date('internshipStartDate')
      table.date('internshipEndDate')
      table.date('sickLeaveStartDate')
      table.date('sickLeaveEndDate')
      table.date('maternityLeaveStartDate')
      table.date('retirementStartDate')
      table.date('invalidityStartDate')
      table.date('jobSearchEndDate')
    })
    .then(() =>
      knex
        .raw(`SELECT * FROM "declarations"`)
        .then(async ({ rows: declarations }) => {
          for (const i in declarations) {
            let internshipStartDate = get(
              declarations[i],
              'dates.internship[0].startDate',
              null,
            )
            let internshipEndDate = get(
              declarations[i],
              'dates.internship[0].endDate',
              null,
            )
            let sickLeaveStartDate = get(
              declarations[i],
              'dates.sickLeave[0].startDate',
              null,
            )
            let sickLeaveEndDate = get(
              declarations[i],
              'dates.sickLeave[0].endDate',
              null,
            )
            let maternityLeaveStartDate = get(
              declarations[i],
              'dates.maternityLeave[0].startDate',
              null,
            )
            let retirementStartDate = get(
              declarations[i],
              'dates.retirement[0].startDate',
              null,
            )
            let invalidityStartDate = get(
              declarations[i],
              'dates.invalidity[0].startDate',
              null,
            )
            let jobSearchEndDate = get(
              declarations[i],
              'dates.jobSearch[0].endDate',
              null,
            )

            // Converting the dates on rollback will cause pg to interpret dates like
            // 2018-12-31T23:00:00.000Z (2019-01-01 at Paris local time, which is server time)
            // as '2018-12-31' in the date field. thus, we add one day to avoid that issue.
            internshipStartDate =
              internshipStartDate &&
              addDays(internshipStartDate, 1).toISOString()
            internshipEndDate =
              internshipEndDate && addDays(internshipEndDate, 1).toISOString()
            sickLeaveStartDate =
              sickLeaveStartDate && addDays(sickLeaveStartDate, 1).toISOString()
            sickLeaveEndDate =
              sickLeaveEndDate && addDays(sickLeaveEndDate, 1).toISOString()
            maternityLeaveStartDate =
              maternityLeaveStartDate &&
              addDays(maternityLeaveStartDate, 1).toISOString()
            retirementStartDate =
              retirementStartDate &&
              addDays(retirementStartDate, 1).toISOString()
            invalidityStartDate =
              invalidityStartDate &&
              addDays(invalidityStartDate, 1).toISOString()
            jobSearchEndDate =
              jobSearchEndDate && addDays(jobSearchEndDate, 1).toISOString()

            const string = [
              `"internshipStartDate"='${internshipStartDate}'`,
              `"internshipEndDate"='${internshipEndDate}'`,
              `"sickLeaveStartDate"='${sickLeaveStartDate}'`,
              `"sickLeaveEndDate"='${sickLeaveEndDate}'`,
              `"maternityLeaveStartDate"='${maternityLeaveStartDate}'`,
              `"retirementStartDate"='${retirementStartDate}'`,
              `"invalidityStartDate"='${invalidityStartDate}'`,
              `"jobSearchEndDate"='${jobSearchEndDate}'`,
            ]
              .filter((s) => !s.includes('null'))
              .join(', ')

            if (!string) continue /* eslint-disable-line */

            await knex.raw(
              `UPDATE declarations set ${string} WHERE id=${
                declarations[i].id
              }`,
            )
          }
        }),
    )
    .then(() =>
      knex.schema.table('declarations', (table) => {
        table.dropColumn('dates')
      }),
    )
    .then(() => knex.schema.renameTable('declarations', 'Declarations'))
}
