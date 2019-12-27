/* eslint-disable */
exports.up = function(knex) {
  return knex('declaration_months').insert([
    {
      month: new Date('2020-01-01T00:00:00.000Z'),
      startDate: new Date('2020-01-28T00:00:00.000Z'),
      endDate: new Date('2020-02-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-02-01T00:00:00.000Z'),
      startDate: new Date('2020-02-26T00:00:00.000Z'),
      endDate: new Date('2020-03-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-03-01T00:00:00.000Z'),
      startDate: new Date('2020-03-28T00:00:00.000Z'),
      endDate: new Date('2020-04-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-04-01T00:00:00.000Z'),
      startDate: new Date('2020-04-28T00:00:00.000Z'),
      endDate: new Date('2020-05-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-05-01T00:00:00.000Z'),
      startDate: new Date('2020-05-28T00:00:00.000Z'),
      endDate: new Date('2020-06-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-06-01T00:00:00.000Z'),
      startDate: new Date('2020-06-28T00:00:00.000Z'),
      endDate: new Date('2020-07-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-07-01T00:00:00.000Z'),
      startDate: new Date('2020-07-28T00:00:00.000Z'),
      endDate: new Date('2020-08-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-08-01T00:00:00.000Z'),
      startDate: new Date('2020-08-28T00:00:00.000Z'),
      endDate: new Date('2020-09-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-09-01T00:00:00.000Z'),
      startDate: new Date('2020-09-28T00:00:00.000Z'),
      endDate: new Date('2020-10-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-10-01T00:00:00.000Z'),
      startDate: new Date('2020-10-28T00:00:00.000Z'),
      endDate: new Date('2020-11-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-11-01T00:00:00.000Z'),
      startDate: new Date('2020-11-28T00:00:00.000Z'),
      endDate: new Date('2020-12-16T00:00:00.000Z'),
    },
    {
      month: new Date('2020-12-01T00:00:00.000Z'),
      startDate: new Date('2020-12-28T00:00:00.000Z'),
      endDate: new Date('2021-01-16T00:00:00.000Z'),
    },
  ])
}

exports.down = function(knex) {
  return knex.raw(`DELETE FROM declaration_months WHERE month >= '2020-01-01'`)
}
