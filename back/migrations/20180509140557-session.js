'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.sequelize
      .query(
        `CREATE TABLE "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);`,
        { type: queryInterface.sequelize.QueryTypes.CREATE },
      )
      .then((created) =>
        queryInterface.sequelize.query(
          `ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE`,
          { type: queryInterface.sequelize.QueryTypes.ALTER },
        ),
      )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('session')
  },
}
