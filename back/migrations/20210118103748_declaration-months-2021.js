/* eslint-disable */
exports.up = function(knex) {
  return knex('declaration_months').insert([
    {
      month: new Date('2021-01-01T00:00:00.000Z'),
      startDate: new Date('2021-01-28T00:00:00.000Z'),
      endDate: new Date('2021-02-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-02-01T00:00:00.000Z'),
      startDate: new Date('2021-02-26T00:00:00.000Z'),
      endDate: new Date('2021-03-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-03-01T00:00:00.000Z'),
      startDate: new Date('2021-03-28T00:00:00.000Z'),
      endDate: new Date('2021-04-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-04-01T00:00:00.000Z'),
      startDate: new Date('2021-04-28T00:00:00.000Z'),
      endDate: new Date('2021-05-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-05-01T00:00:00.000Z'),
      startDate: new Date('2021-05-28T00:00:00.000Z'),
      endDate: new Date('2021-06-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-06-01T00:00:00.000Z'),
      startDate: new Date('2021-06-28T00:00:00.000Z'),
      endDate: new Date('2021-07-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-07-01T00:00:00.000Z'),
      startDate: new Date('2021-07-28T00:00:00.000Z'),
      endDate: new Date('2021-08-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-08-01T00:00:00.000Z'),
      startDate: new Date('2021-08-28T00:00:00.000Z'),
      endDate: new Date('2021-09-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-09-01T00:00:00.000Z'),
      startDate: new Date('2021-09-28T00:00:00.000Z'),
      endDate: new Date('2021-10-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-10-01T00:00:00.000Z'),
      startDate: new Date('2021-10-28T00:00:00.000Z'),
      endDate: new Date('2021-11-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-11-01T00:00:00.000Z'),
      startDate: new Date('2021-11-28T00:00:00.000Z'),
      endDate: new Date('2021-12-16T00:00:00.000Z'),
    },
    {
      month: new Date('2021-12-01T00:00:00.000Z'),
      startDate: new Date('2021-12-28T00:00:00.000Z'),
      endDate: new Date('2022-01-16T00:00:00.000Z'),
    },
  ])
}

exports.down = function(knex) {
  return knex.raw(`DELETE FROM declaration_months WHERE month >= '2021-01-01'`)
}
