/* eslint-disable */

const { Model } = require('objection')
const Knex = require('knex')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const User = require('../models/User')

const potentialUsers = require('./potential-users.js')

async function findUser(potentialUser) {
  return User.query()
    .where({ lastName: potentialUser.lastName })
    .then((results) => {
      // don't take risks with ambiguous results
      if (results.length > 1) return null
      return results[0]
    })
}

/*
// This function gives an updated version of potentialUsers
;(async function() {
  for (const potentialUser of potentialUsers) {
    const user = await findUser(potentialUser)
    if (user) {
      potentialUser.id = user.id
    }
  }
  console.log(JSON.stringify(potentialUsers, null, 2))
})()
*/

// This function updates all users for who we have ids to add pe data
;(async function() {
  const usersWeWillUpdate = potentialUsers.filter(({ id }) => id)

  for (const userData of usersWeWillUpdate) {
    await User.query()
      .findOne({ id: userData.id })
      .then((dbUser) =>
        dbUser.$query().patch({
          peCode: userData.peCode,
          pePass: userData.pePass,
          postalCode: userData.postalCode,
        }),
      )
  }
})()
