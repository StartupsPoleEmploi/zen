/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

const { Model } = require('objection')
const testLogin = require('./lib/headless-pilot/testLogin')
const User = require('./models/User')
const Knex = require('knex')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

console.log('Testing for env', process.env.NODE_ENV)

User.query()
  .whereNotNull('peCode')
  .then(async (users) => {
    console.log(users.length, ' users')
    for (const user of users) {
      try {
        await testLogin(user)
      } catch (e) {
        console.error(user.id)
      }
    }
  })
