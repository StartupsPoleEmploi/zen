const express = require('express')
const { format, subDays } = require('date-fns')
const zip = require('express-easy-zip')
const path = require('path')
const superagent = require('superagent')
const { get, isUndefined, kebabCase } = require('lodash')
const { uploadsDirectory: uploadDestination } = require('config')
const { Parser } = require('json2csv')
const { raw } = require('objection')

const winston = require('../lib/log')
const { computePeriods, formatQueryResults } = require('../lib/admin/metrics')
const {
  getAllCodeAgencyFromRegionSlug,
  getAllCodeAgencyFromDepartmentSlug,
  getAgence,
} = require('../lib/admin/geo')
const { deleteUser } = require('../lib/user')
const { computeFields, DATA_EXPORT_FIELDS } = require('../lib/exportUserList')

const ActivityLog = require('../models/ActivityLog')
const Declaration = require('../models/Declaration')

const DeclarationMonth = require('../models/DeclarationMonth')
const DeclarationReview = require('../models/DeclarationReview')

const User = require('../models/User')
const Status = require('../models/Status')

const router = express.Router()
router.use(zip())

router.get('/declarationsMonths', (req, res, next) => {
  DeclarationMonth.query()
    .where('startDate', '<=', new Date())
    .orderBy('startDate', 'desc')
    .then((declarationMonths) => res.json(declarationMonths))
    .catch(next)
})

router.get('/declarations', (req, res, next) => {
  if (!req.query.monthId) {
    return res.status(501).json('Must add monthId as query param')
  }

  Declaration.query()
    .eager('user')
    .where({ monthId: req.query.monthId })
    .then((declarations) => res.json(declarations))
    .catch(next)
})

router.get('/users', async (req, res, next) => {
  const isAuthorized = req.query.authorized === 'true'

  try {
    const users = await User.query()
      .where({ isAuthorized })
      .whereNotNull('registeredAt')
    return res.json(users)
  } catch (err) {
    next(err)
  }
})

router.get('/users/csv', async (req, res, next) => {
  const isAuthorized = req.query.authorized === 'true'

  try {
    const users = await User.query()
      .eager('[declarations.[declarationMonth], activityLogs]')
      .where({ isAuthorized })
      .whereNotNull('registeredAt')

    const months = await DeclarationMonth.query()
      .where('startDate', '<=', 'now')
      .orderBy('startDate', 'DESC')

    const json2csvParser = new Parser({
      fields: isAuthorized ? computeFields(months) : DATA_EXPORT_FIELDS,
    })
    const csv = json2csvParser.parse(users)

    res.set(
      'Content-disposition',
      `attachment; filename=utilisateurs-${
        !isAuthorized ? 'non-' : ''
      }autorisés-${format(new Date(), 'YYYY-MM-DD')}.csv`,
    )
    res.set('Content-type', 'text/csv')
    return res.send(csv)
  } catch (err) {
    next(err)
  }
})

router.get('/declaration/users/csv', async (req, res, next) => {
  const { condition, monthId } = req.query
  if (!monthId || Number.isNaN(+monthId)) return res.send(400)

  // Filename
  let filename = 'actualisations-debutees'
  if (condition === 'hasFinishedDeclaringEmployers') {
    filename = 'actualisations-terminees'
  } else if (condition === 'isFinished') filename = 'documents-envoyes'

  // Query
  const query = Declaration.query()
    .eager('user')
    .where({ monthId })

  if (condition === 'hasFinishedDeclaringEmployers') {
    query.andWhere({ hasFinishedDeclaringEmployers: true })
  } else if (condition === 'isFinished') {
    query.andWhere({ isFinished: true })
  }

  const declarations = await query.execute()
  const users = declarations.map((d) => d.user)

  // Generate CSV
  try {
    const json2csvParser = new Parser({ DATA_EXPORT_FIELDS })
    const csv = json2csvParser.parse(users)
    res.set(
      'Content-disposition',
      `attachment; filename=${filename}-${format(
        new Date(),
        'YYYY-MM-DD',
      )}.csv`,
    )
    res.set('Content-type', 'text/csv')
    return res.send(csv)
  } catch (err) {
    next(err)
  }
})

// get users *not* in db
router.post('/users/filter', (req, res, next) => {
  let emails
  try {
    emails = req.body.emails.map((email) => email.toLowerCase())
  } catch (err) {
    return next(err)
  }

  const query = User.query().whereNotNull('registeredAt')

  query.where(function() {
    this.where('email', 'ilike', emails[0])
    emails.slice(1).forEach((email) => {
      this.orWhere('email', 'ilike', email)
    })
  })

  return query
    .then((usersInDb) => {
      const usersInDbEmails = usersInDb.map(({ email }) => email.toLowerCase())
      return res.json(
        emails.filter((email) => !usersInDbEmails.includes(email)),
      )
    })
    .catch(next)
})

router.post('/declarations/review', (req, res, next) => {
  if (
    !req.body.declarationId ||
    (!req.body.notes && isUndefined(req.body.isVerified))
  ) {
    return res.status(400).json('Incomplete request')
  }

  Declaration.query()
    .eager('review')
    .findById(req.body.declarationId)
    .then((declaration) => {
      const declarationNoteObj = {}

      if ('isVerified' in req.body) {
        declarationNoteObj.isVerified = req.body.isVerified
      }
      if ('notes' in req.body) {
        declarationNoteObj.notes = req.body.notes
      }

      if (declaration.review) {
        return declaration.review
          .$query()
          .patch(declarationNoteObj)
          .then(() => res.json('ok'))
      }

      return DeclarationReview.query()
        .insert({
          declarationId: req.body.declarationId,
          ...declarationNoteObj,
        })
        .then(() => res.json('ok'))
    })
    .catch(next)
})

// No login form for now, users must be inserted in db manually.
router.get('/activityLog', (req, res) => {
  ActivityLog.query()
    .eager('user')
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .then((logs) => res.json(logs))
})

router.get('/declarations/:declarationId/files', (req, res) => {
  Declaration.query()
    .eager(`[infos, employers.documents, user, declarationMonth]`)
    .findById(req.params.declarationId)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')

      const formattedMonth = format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )

      const files = declaration.infos
        .map((info) => ({
          label: info.type,
          value: info.file,
        }))
        .concat(
          declaration.employers.map((employer) => ({
            label: `employer-${employer.employerName}`,
            value: get(employer, 'documents[0].file'),
          })),
        )
        .filter(({ value }) => value) // remove null values
        .map((file, key) => ({
          path: `${uploadDestination}${file.value}`,
          name: kebabCase(
            `${declaration.user.firstName}-${declaration.user.lastName}-${
              file.label
            }-${formattedMonth}-${String.fromCharCode(key + 97)}`, // identifier to avoid duplicates
          ).concat(
            // PE.fr uploads do not handle "jpeg" files (-_-), so renaming on the fly.
            path.extname(file.value) === '.jpeg'
              ? '.jpg'
              : path.extname(file.value),
          ),
        }))

      if (files.length === 0) return res.send('Pas de fichiers disponibles')

      res.zip({
        files,
        filename: `${declaration.user.firstName}-${
          declaration.user.lastName
        }-${formattedMonth}-fichiers-${
          declaration.isFinished ? 'validés' : 'non-validés'
        }.zip`,
      })
    })
})

router.post('/status-global', (req, res, next) =>
  Status.query()
    .patch({ up: req.body.up })
    .returning('*')
    .then((result) => {
      const message = `Suite à une action effectué dans l'interface d'administration, Zen est maintenant *${
        req.body.up ? 'activé' : 'désactivé'
      }*`

      // No return for this promise : Slack being up or not should prevent us from sending back a 200
      superagent
        .post(process.env.SLACK_WEBHOOK_SU_ZEN, {
          text: message,
        })
        .catch((err) => winston.warn('Error sending message to Slack', err))

      return res.json(result[0])
    })
    .catch(next),
)

router.post('/status-files', (req, res, next) =>
  Status.query()
    .patch({ isFilesServiceUp: req.body.up })
    .returning('*')
    .then((result) => {
      const message = `Suite à une action effectué dans l'interface d'administration, l'envoi de justificatifs est *${
        req.body.up ? 'activé' : 'désactivé'
      }*`

      // No return for this promise : Slack being up or not should prevent us from sending back a 200
      superagent
        .post(process.env.SLACK_WEBHOOK_SU_ZEN, {
          text: message,
        })
        .catch((err) => winston.warn('Error sending message to Slack', err))

      return res.json(result[0])
    })
    .catch(next),
)

router.delete('/delete-user', (req, res, next) => {
  const { userId } = req.query
  if (!userId) throw new Error('No user id given')

  User.query()
    .eager('[employers.documents, declarations.[infos,review]]')
    .findById(userId)
    .then((user) => {
      if (!user) throw new Error('No such user id')
      return deleteUser(user)
    })
    .then(() => res.send('ok'))
    .catch(next)
})

router.get('/users/:id', (req, res, next) => {
  User.query()
    .eager('[activityLogs, declarations.[infos, review, employers.documents]]')
    .findById(req.params.id)
    .then((user) => {
      if (!user) return res.send(404, 'User not found')
      return res.json(user)
    })
    .catch(next)
})

router.get('/declarations/:id', (req, res, next) => {
  Declaration.query()
    .eager('[user, employers.documents, review, infos, declarationMonth]')
    .findById(req.params.id)
    .then((declaration) => {
      if (!declaration) return res.send(404, 'Declaration not found')
      return res.json(declaration)
    })
    .catch(next)
})

router.get('/retention', async (req, res) => {
  const { monthId } = req.query

  if (!monthId || Number.isNaN(+monthId)) return res.send(400)

  /** 1- Retention global + by month */
  // Users who have done their first declaration in this period
  const firstDeclarationsIds = await Declaration.query()
    .select('userId')
    .where('hasFinishedDeclaringEmployers', true)
    .where({ monthId })
    .groupBy('userId')
    .havingRaw('COUNT("userId") = 1')

  const declarationMonths = await DeclarationMonth.query()
    .andWhere('startDate', '<=', 'now')
    .andWhere('id', '>', monthId)
    .orderBy('id')
    .limit(6)

  const results = {
    baseUserNumber: firstDeclarationsIds.length,
    nextMonths: [],
  }

  // Extract only ids
  const ids = firstDeclarationsIds.map((i) => i.userId)

  // Users with at least one declaration in the next six month
  const oneDeclarationAtLeast = new Set()

  for (const m of declarationMonths) {
    // eslint-disable-next-line no-await-in-loop
    const users = await Declaration.query()
      .select('userId')
      .where('hasFinishedDeclaringEmployers', true)
      .where({ monthId: m.id })
      .whereIn('userId', ids)

    results.nextMonths.push({
      month: m.month,
      value: users.length,
    })

    const userIds = users.map((u) => u.userId)
    userIds.forEach((i) => oneDeclarationAtLeast.add(i))
  }

  // Users which have done at least one actualisation in the next 6 months
  results.oneDeclarationInSixMonths = oneDeclarationAtLeast.size

  /** 2-  */
  // Total of user
  const declarationMonth = await DeclarationMonth.query().findById(monthId)
  const firstLoginUserCount = await User.query()
    .count()
    .where('registeredAt', '>', declarationMonth.startDate)
    .andWhere('registeredAt', '<', declarationMonth.endDate)

  // Declaration 24h after their first login
  const startDeclarationLess24h = await Declaration.query()
    .joinRelation('user')
    .where({ monthId })
    .andWhere(
      'declarations.createdAt',
      '<',
      raw(`"registeredAt" + interval '1 day'`),
    )

  results.firstLoginUserCount = firstLoginUserCount[0].count
  results.firstDeclarationLess24h = startDeclarationLess24h.length
  results.employerFinishedDeclarationLess24h = startDeclarationLess24h.filter(
    (d) => d.hasFinishedDeclaringEmployers,
  ).length
  results.validateAllFilesDeclarationLess24h = startDeclarationLess24h.filter(
    (d) => d.isFinished,
  ).length

  return res.json(results)
})

/**
 * Compute global metrics
 */

router.get('/metrics/global', async (req, res) => {
  const results = {}

  // Global users registered
  const globalUserCount = await User.query()
    .count()
    .whereNotNull('Users.registeredAt')
  results.globalUserRegistered = globalUserCount[0].count

  // Registered users by month
  results.userRegistedByMonth = await User.query()
    .select(raw(`to_char("registeredAt", 'yyyy-mm') as month, COUNT('id')`))
    .whereNotNull('Users.registeredAt')
    .groupByRaw(`to_char("registeredAt", 'yyyy-mm')`)
    .orderByRaw(`to_char("registeredAt", 'yyyy-mm')`)

  // Global declarations done
  const globalDeclarationDone = await Declaration.query()
    .count()
    .where({ hasFinishedDeclaringEmployers: true })
  results.globalDeclarationsDone = globalDeclarationDone[0].count

  // Declarations done by monthId
  results.declarationsDoneByMonth = await Declaration.query()
    .eager('declarationMonth')
    .select()
    .count('id')
    .where({ hasFinishedDeclaringEmployers: true })
    .groupBy('monthId')
    .orderBy('monthId')

  return res.json(results)
})

/**
 * Compute users registered during two periods of time
 */
router.get('/metrics/new-users', async (req, res) => {
  const { first, second, duration } = req.query
  if (!first || !second || !duration) return res.send(400)

  const {
    startFirstPeriod,
    endFirstPeriod,
    startSecondPeriod,
    endSecondPeriod,
  } = computePeriods(req.query)

  // First period
  const firstPeriodData = await User.query()
    .select(raw(`to_char("registeredAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('registeredAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('registeredAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .groupByRaw(`to_char("registeredAt", 'yyyy-mm-dd')`)

  const secondPeriodData = await User.query()
    .select(raw(`to_char("registeredAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('registeredAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('registeredAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .groupByRaw(`to_char("registeredAt", 'yyyy-mm-dd')`)

  return res.json(formatQueryResults(firstPeriodData, secondPeriodData))
})

/**
 * Compute declarations started for two periods of time
 */
router.get('/metrics/declaration-started', async (req, res) => {
  const { first, second, duration } = req.query
  if (!first || !second || !duration) return res.send(400)

  const {
    startFirstPeriod,
    endFirstPeriod,
    startSecondPeriod,
    endSecondPeriod,
  } = computePeriods(req.query)

  const accumulate =
    'accumulate' in req.query && req.query.accumulate === 'true'

  const firstPeriodData = await Declaration.query()
    .select(raw(`to_char("createdAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('createdAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .groupByRaw(`to_char("createdAt", 'yyyy-mm-dd')`)

  const secondPeriodData = await Declaration.query()
    .select(raw(`to_char("createdAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('createdAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .groupByRaw(`to_char("createdAt", 'yyyy-mm-dd')`)

  return res.json(
    formatQueryResults(firstPeriodData, secondPeriodData, accumulate),
  )
})

/**
 * Compute declarations finished for two periods of time
 */
router.get('/metrics/declaration-finished', async (req, res) => {
  const { first, second, duration } = req.query
  if (!first || !second || !duration) return res.send(400)

  const {
    startFirstPeriod,
    endFirstPeriod,
    startSecondPeriod,
    endSecondPeriod,
  } = computePeriods(req.query)

  const accumulate =
    'accumulate' in req.query && req.query.accumulate === 'true'

  const firstPeriodData = await ActivityLog.query()
    .select(raw(`to_char("createdAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('createdAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_EMPLOYERS')
    .groupByRaw(`to_char("createdAt", 'yyyy-mm-dd')`)

  const secondPeriodData = await ActivityLog.query()
    .select(raw(`to_char("createdAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('createdAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_EMPLOYERS')
    .groupByRaw(`to_char("createdAt", 'yyyy-mm-dd')`)

  return res.json(
    formatQueryResults(firstPeriodData, secondPeriodData, accumulate),
  )
})

/**
 * Compute files transmitted for two periods of time
 */
router.get('/metrics/files-end', async (req, res) => {
  const { first, second, duration } = req.query
  if (!first || !second || !duration) return res.send(400)

  const {
    startFirstPeriod,
    endFirstPeriod,
    startSecondPeriod,
    endSecondPeriod,
  } = computePeriods(req.query)

  const accumulate =
    'accumulate' in req.query && req.query.accumulate === 'true'

  const firstPeriodData = await ActivityLog.query()
    .select(raw(`to_char("createdAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('createdAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_FILES')
    .groupByRaw(`to_char("createdAt", 'yyyy-mm-dd')`)

  const secondPeriodData = await ActivityLog.query()
    .select(raw(`to_char("createdAt", 'yyyy-mm-dd') as date, count(*)`))
    .where('createdAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_FILES')
    .groupByRaw(`to_char("createdAt", 'yyyy-mm-dd')`)

  return res.json(
    formatQueryResults(firstPeriodData, secondPeriodData, accumulate),
  )
})

/**
 * Get repartion on all users in database (from the PeDump)
 * */
let peDumpUserRepartition = null
let peDumpLastDate = null
router.get('/repartition/global', async (req, res) => {
  if (peDumpLastDate && peDumpLastDate > subDays(new Date(), 1)) {
    return res.json(peDumpUserRepartition)
  }

  // Compute values
  peDumpUserRepartition = {
    agencies: {},
    regions: {},
    departments: {},
  }
  const users = await User.query()
  peDumpUserRepartition.franceTotal = users.length

  users.forEach((user, i) => {
    if (!user.agencyCode && i > 100) return

    const agency = getAgence(user.agencyCode)
    if (!agency) return

    const { region, departement } = agency

    // Region
    if (peDumpUserRepartition.regions[region] === undefined) {
      peDumpUserRepartition.regions[region] = 0
    }
    peDumpUserRepartition.regions[region] += 1

    // Department
    if (peDumpUserRepartition.departments[departement] === undefined) {
      peDumpUserRepartition.departments[departement] = 0
    }
    peDumpUserRepartition.departments[departement] += 1

    // Agencies
    if (peDumpUserRepartition.agencies[user.agencyCode] === undefined) {
      peDumpUserRepartition.agencies[user.agencyCode] = 0
    }
    peDumpUserRepartition.agencies[user.agencyCode] += 1
  })
  peDumpLastDate = new Date()

  return res.json(peDumpUserRepartition)
})

router.get('/repartition/region', async (req, res) => {
  const { region, monthId } = req.query
  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400)
  }

  let agencies = []
  try {
    agencies = getAllCodeAgencyFromRegionSlug(region)
  } catch {
    return res.send(400)
  }

  const declarations = await Declaration.query()
    .joinEager('user')
    .where({ monthId })
    .andWhere('user.agencyCode', 'in', agencies)

  return res.json(declarations)
})

router.get('/repartition/department', async (req, res) => {
  const { department, monthId } = req.query

  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400)
  }

  let agencies = []
  try {
    agencies = getAllCodeAgencyFromDepartmentSlug(department)
  } catch {
    return res.send(400)
  }

  const declarations = await Declaration.query()
    .joinEager('user')
    .where({ monthId })
    .andWhere('user.agencyCode', 'in', agencies)

  return res.json(declarations)
})

router.get('/repartition/agency', async (req, res) => {
  const { agencyCode, monthId } = req.query
  if (!agencyCode || Number.isNaN(+agencyCode)) return res.send(400)
  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400)
  }

  const declarations = await Declaration.query()
    .joinEager('user')
    .where({ monthId, 'user.agencyCode': agencyCode })

  return res.json(declarations)
})

router.get('/repartition/agency/csv', async (req, res) => {
  const { filter, agencyCode, monthId } = req.query

  // Validate fields
  if (!agencyCode || Number.isNaN(+agencyCode)) return res.send(400)
  if (!filter || !['actuDone', 'allUsers'].includes(filter)) {
    return res.send(400)
  }

  if (filter === 'actuDone' && (!monthId || Number.isNaN(+monthId))) {
    return res.send(400)
  }

  // Do queries
  let users
  let filename
  if (filter === 'allUsers') {
    users = await User.query().where({ agencyCode })
    filename = `demandeurs-agence-${agencyCode}`
  } else {
    const declarations = await Declaration.query()
      .joinEager('user')
      .where({ monthId, 'user.agencyCode': agencyCode })
    users = declarations.map((dec) => dec.user)
    filename = `actualisation-terminees-${agencyCode}`
  }

  const json2csvParser = new Parser({
    fields: [
      { label: 'Prenom', value: 'firstName' },
      { label: 'Nom', value: 'lastName' },
      { label: 'E-mail', value: 'email' },
      { label: 'Code postal', value: 'postalCode' },
    ],
  })
  const csv = json2csvParser.parse(users)
  res.set(
    'Content-disposition',
    `attachment; filename=${filename}-${format(new Date(), 'YYYY-MM-DD')}.csv`,
  )
  res.set('Content-type', 'text/csv')
  return res.send(csv)
})

module.exports = router
