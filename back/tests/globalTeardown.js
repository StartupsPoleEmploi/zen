const knex = require('../lib/db')

module.exports = () => knex.destroy()
