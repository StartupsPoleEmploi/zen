const Knex = require('knex')
const { Model } = require('objection')
const knexData = require('../knexfile').test

const knex = Knex(knexData)
Model.knex(knex)
