/* eslint-disable no-console */
const Declaration = require('../models/Declaration')
const User = require('../models/User')

Promise.all([
  User.count(),
  Declaration.count(),
  Declaration.count({ hasFinishedDeclaringEmployers: true }),
  Declaration.count({ isFinished: true }),
])
  .then(
    ([
      usersCount,
      declarationsCount,
      declarationsWithEmployersCount,
      declarationsFinishedCount,
    ]) => {
      console.log(`
    Utilisateurs connectés : ${usersCount},
    Étape 1 terminée : ${declarationsCount},
    Étape 2 terminée : ${declarationsWithEmployersCount},
    Étape 3 terminée : ${declarationsFinishedCount},
  `)
    },
  )
  .then(() => process.exit())
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
