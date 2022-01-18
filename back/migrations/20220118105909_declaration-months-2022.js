/* eslint-disable */
exports.up = function(knex) {
    return knex('declaration_months').insert([
        {
            month: new Date('2022-01-01T00:00:00.000Z'),
            startDate: new Date('2022-01-28T00:00:00.000Z'),
            endDate: new Date('2022-02-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-02-01T00:00:00.000Z'),
            startDate: new Date('2022-02-26T00:00:00.000Z'),
            endDate: new Date('2022-03-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-03-01T00:00:00.000Z'),
            startDate: new Date('2022-03-28T00:00:00.000Z'),
            endDate: new Date('2022-04-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-04-01T00:00:00.000Z'),
            startDate: new Date('2022-04-28T00:00:00.000Z'),
            endDate: new Date('2022-05-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-05-01T00:00:00.000Z'),
            startDate: new Date('2022-05-28T00:00:00.000Z'),
            endDate: new Date('2022-06-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-06-01T00:00:00.000Z'),
            startDate: new Date('2022-06-28T00:00:00.000Z'),
            endDate: new Date('2022-07-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-07-01T00:00:00.000Z'),
            startDate: new Date('2022-07-28T00:00:00.000Z'),
            endDate: new Date('2022-08-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-08-01T00:00:00.000Z'),
            startDate: new Date('2022-08-28T00:00:00.000Z'),
            endDate: new Date('2022-09-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-09-01T00:00:00.000Z'),
            startDate: new Date('2022-09-28T00:00:00.000Z'),
            endDate: new Date('2022-10-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-10-01T00:00:00.000Z'),
            startDate: new Date('2022-10-28T00:00:00.000Z'),
            endDate: new Date('2022-11-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-11-01T00:00:00.000Z'),
            startDate: new Date('2022-11-28T00:00:00.000Z'),
            endDate: new Date('2022-12-16T00:00:00.000Z'),
        },
        {
            month: new Date('2022-12-01T00:00:00.000Z'),
            startDate: new Date('2022-12-28T00:00:00.000Z'),
            endDate: new Date('2023-01-16T00:00:00.000Z'),
        },
    ])
}

exports.down = function(knex) {
    return knex.raw(`DELETE FROM declaration_months WHERE month >= '2022-01-01'`)
}
