/* eslint-disable */
exports.up = function(knex) {
  return knex('declaration_months').insert([
    {
      month: new Date('2019-01-01T00:00:00.000Z'),
      startDate: new Date('2019-01-28T00:00:00.000Z'),
      endDate: new Date('2019-02-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-02-01T00:00:00.000Z'),
      startDate: new Date('2019-02-28T00:00:00.000Z'),
      endDate: new Date('2019-03-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-03-01T00:00:00.000Z'),
      startDate: new Date('2019-03-28T00:00:00.000Z'),
      endDate: new Date('2019-04-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-04-01T00:00:00.000Z'),
      startDate: new Date('2019-04-28T00:00:00.000Z'),
      endDate: new Date('2019-05-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-05-01T00:00:00.000Z'),
      startDate: new Date('2019-05-28T00:00:00.000Z'),
      endDate: new Date('2019-06-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-06-01T00:00:00.000Z'),
      startDate: new Date('2019-06-28T00:00:00.000Z'),
      endDate: new Date('2019-07-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-07-01T00:00:00.000Z'),
      startDate: new Date('2019-07-28T00:00:00.000Z'),
      endDate: new Date('2019-08-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-08-01T00:00:00.000Z'),
      startDate: new Date('2019-08-28T00:00:00.000Z'),
      endDate: new Date('2019-09-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-09-01T00:00:00.000Z'),
      startDate: new Date('2019-09-28T00:00:00.000Z'),
      endDate: new Date('2019-10-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-10-01T00:00:00.000Z'),
      startDate: new Date('2019-10-28T00:00:00.000Z'),
      endDate: new Date('2019-11-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-11-01T00:00:00.000Z'),
      startDate: new Date('2019-11-28T00:00:00.000Z'),
      endDate: new Date('2019-12-16T00:00:00.000Z'),
    },
    {
      month: new Date('2019-12-01T00:00:00.000Z'),
      startDate: new Date('2019-12-28T00:00:00.000Z'),
      endDate: new Date('2020-01-16T00:00:00.000Z'),
    },
  ])
}

exports.down = function(knex) {
  return knex.raw(`DELETE FROM declaration_months WHERE month >= '2019-01-01'`)
}
