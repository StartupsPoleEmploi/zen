/* eslint-disable */
exports.up = function(knex) {
  return knex.schema
    .hasTable('session')
    .then((exists) => {
      if (exists) return Promise.reject({ done: true })
      return knex
        .raw(
          `CREATE TABLE "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);`,
        )
        .then((created) =>
          knex.raw(
            `ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE`,
          ),
        )
    })
    .catch((err) => {
      if (err.done) return Promise.resolve()
      return Promise.reject(err)
    })
}

exports.down = function(knex, Promise) {}
