const postgres = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
}

module.exports = {
  development: postgres,
  staging: postgres,
  production: postgres,
  test: {
    client: 'sqlite3',
    connection: {
      filename: './db.sqlite',
    },
    useNullAsDefault: false,
  },
}
