exports.up = async function up(knex) {
  await knex.schema.table('activity_logs', (table) => {
    table.index('action');
  });
  await knex.schema.table('conseillers_help_query', (table) => {
    table.index('email');
  });
  await knex.schema.table('declarations', (table) => {
    table.index('monthId');
    table.index('hasFinishedDeclaringEmployers');
    table.index('isFinished');
    table.index('isEmailSent');
    table.index('isDocEmailSent');
    table.index('transmittedAt');
    table.index('createdAt');
    table.index('updatedAt');
  });
  await knex.schema.table('declaration_infos', (table) => {
    table.index('declarationId');
    table.index('type');
    table.index('startDate');
    table.index('endDate');
    table.index('isTransmitted');
    table.index('isCleanedUp');
  });
  await knex.schema.table('declaration_months', (table) => {
    table.index('startDate');
    table.index('endDate');
  });
  await knex.schema.table('declaration_reviews', (table) => {
    table.index('declarationId');
    table.index('isVerified');
  });
  await knex.schema.table('employer_documents', (table) => {
    table.index('type');
    table.index('employerId');
    table.index('isTransmitted');
    table.index('isCleanedUp');
  });
  await knex.schema.table('Users', (table) => {
    table.index('gender');
    table.index('email');
    table.index('postalCode');
    table.index('agencyCode');
    table.index('isAuthorized');
    table.index('isBlocked');
    table.index('isActuDone');
    table.index('lastDocsReminderDate');
    table.index('registeredAt');
    table.index('isSubscribedEmail');
    table.index('createdAt');
    table.index('updatedAt');
  });
  await knex.schema.table('useradmins', (table) => {
    table.index('email');
    table.index('type');
  });
};

exports.down = async function down(knex) {
  await knex.schema.table('activity_logs', (table) => {
    table.dropIndex('action');
  });
  await knex.schema.table('activity_logs', (table) => {
    table.dropIndex('action');
  });
  await knex.schema.table('conseillers_help_query', (table) => {
    table.dropIndex('email');
  });
  await knex.schema.table('declarations', (table) => {
    table.dropIndex('monthId');
    table.dropIndex('hasFinishedDeclaringEmployers');
    table.dropIndex('isFinished');
    table.dropIndex('isEmailSent');
    table.dropIndex('isDocEmailSent');
    table.dropIndex('transmittedAt');
    table.dropIndex('createdAt');
    table.dropIndex('updatedAt');
  });
  await knex.schema.table('declaration_infos', (table) => {
    table.dropIndex('declarationId');
    table.dropIndex('type');
    table.dropIndex('startDate');
    table.dropIndex('endDate');
    table.dropIndex('isTransmitted');
    table.dropIndex('isCleanedUp');
  });
  await knex.schema.table('declaration_months', (table) => {
    table.dropIndex('startDate');
    table.dropIndex('endDate');
  });
  await knex.schema.table('declaration_reviews', (table) => {
    table.dropIndex('declarationId');
    table.dropIndex('isVerified');
  });
  await knex.schema.table('employer_documents', (table) => {
    table.dropIndex('type');
    table.dropIndex('employerId');
    table.dropIndex('isTransmitted');
    table.dropIndex('isCleanedUp');
  });
  await knex.schema.table('Users', (table) => {
    table.dropIndex('gender');
    table.dropIndex('email');
    table.dropIndex('postalCode');
    table.dropIndex('agencyCode');
    table.dropIndex('isAuthorized');
    table.dropIndex('isBlocked');
    table.dropIndex('isActuDone');
    table.dropIndex('lastDocsReminderDate');
    table.dropIndex('registeredAt');
    table.dropIndex('isSubscribedEmail');
    table.dropIndex('createdAt');
    table.dropIndex('updatedAt');
  });
  await knex.schema.table('useradmins', (table) => {
    table.dropIndex('email');
    table.dropIndex('type');
  });
};
