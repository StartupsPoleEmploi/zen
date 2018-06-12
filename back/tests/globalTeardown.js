const knex = require('./getKnexTestInstance')

module.exports = () => knex.destroy()
