const knex = require('./getKnexTestInstance')
const { Model } = require('objection')

Model.knex(knex)
