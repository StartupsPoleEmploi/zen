const { Declaration, Employer, User } = require('../models')

Promise.all([
  User.count(),
  Declaration.count(),
  Declaration.count({ where: { hasFinishedDeclaringEmployers: true } }),
  Declaration.count({ where: { isFinished: true } }),
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
