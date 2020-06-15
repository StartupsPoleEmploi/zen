exports.up = async function up(knex) {
  await knex.schema.table('Users', (table) => {
    table.timestamp('registeredAt').defaultTo(null);
  });
  const users = await knex('Users').select();

  await knex.transaction((trx) =>
    Promise.all(
      users.map(async (user) =>
        knex('Users')
          .update({ registeredAt: user.createdAt })
          .where('id', user.id)
          .transacting(trx)),
    )
      .then(trx.commit)
      .catch(trx.rollback));
};

exports.down = async function down(knex) {
  knex.schema.table('Users', (table) => {
    table.dropColumn('registeredAt');
  });
};
