/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .createTable('declaration_months', (table) => {
      table.increments('id').primary()
      table.date('month')
      table.date('startDate')
      table.date('endDate')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())

      table.unique('month')
    })
    .then(() =>
      knex('declaration_months').insert([
        {
          month: new Date('2018-05-01T00:00:00.000Z'),
          startDate: new Date('2018-05-28T00:00:00.000Z'),
          endDate: new Date('2018-06-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-06-01T00:00:00.000Z'),
          startDate: new Date('2018-06-28T00:00:00.000Z'),
          endDate: new Date('2018-07-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-07-01T00:00:00.000Z'),
          startDate: new Date('2018-07-28T00:00:00.000Z'),
          endDate: new Date('2018-08-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-08-01T00:00:00.000Z'),
          startDate: new Date('2018-08-28T00:00:00.000Z'),
          endDate: new Date('2018-09-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-09-01T00:00:00.000Z'),
          startDate: new Date('2018-09-28T00:00:00.000Z'),
          endDate: new Date('2018-10-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-10-01T00:00:00.000Z'),
          startDate: new Date('2018-10-28T00:00:00.000Z'),
          endDate: new Date('2018-11-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-11-01T00:00:00.000Z'),
          startDate: new Date('2018-11-28T00:00:00.000Z'),
          endDate: new Date('2018-12-15T00:00:00.000Z'),
        },
        {
          month: new Date('2018-12-01T00:00:00.000Z'),
          startDate: new Date('2018-12-28T00:00:00.000Z'),
          endDate: new Date('2019-01-15T00:00:00.000Z'),
        },
      ]),
    )
    .then(() =>
      knex.schema.table('Declarations', function(table) {
        table.dropColumn('declaredMonth')
        table.integer('monthId')

        table.foreign('monthId').references('declaration_months.id')
      }),
    )
    .then(() =>
      knex('declaration_months').where(
        'month',
        new Date('2018-05-01T00:00:00.000Z'),
      ),
    )
    .then(([result]) => knex('Declarations').update('monthId', result.id))
    .then(() =>
      knex.schema.table('Declarations', (table) =>
        table
          .integer('monthId')
          .notNullable()
          .alter(),
      ),
    )
}

exports.down = function(knex) {
  return knex.schema
    .table('Declarations', (table) => {
      table.date('declaredMonth')
      table.dropColumn('monthId')
    })
    .then(() => knex.schema.dropTable('declaration_months'))
    .then(() =>
      knex('Declarations').update(
        'declaredMonth',
        new Date('2018-05-01T00:00:00.000Z'),
      ),
    )
}
