const express = require('express');
const {
  addDays,
  format,
  subDays,
  differenceInCalendarDays,
} = require('date-fns');
const zip = require('express-easy-zip');
const { Parser } = require('json2csv');
const { raw } = require('objection');

const { formatQueryResults } = require('../../lib/admin/metrics');
const {
  getAllCodeAgencyFromRegionSlug,
  getAllCodeAgencyFromDepartmentSlug,
  getAgence,
} = require('../../lib/admin/geo');

const ActivityLog = require('../../models/ActivityLog');
const Declaration = require('../../models/Declaration');
const DeclarationMonth = require('../../models/DeclarationMonth');
const User = require('../../models/User');

const router = express.Router();
router.use(zip());

/**
 * Compute global metrics
 */
router.get('/metrics/global', async (req, res) => {
  const results = {};

  // Global users registered
  const globalUserCount = await User.query()
    .count()
    .whereNotNull('Users.registeredAt');
  results.globalUserRegistered = globalUserCount[0].count;

  // Registered users by month
  results.userRegistedByMonth = await User.query()
    .select(raw('to_char("registeredAt", \'yyyy-mm\') as month, COUNT(\'id\')'))
    .whereNotNull('Users.registeredAt')
    .groupByRaw('to_char("registeredAt", \'yyyy-mm\')')
    .orderByRaw('to_char("registeredAt", \'yyyy-mm\')');

  // Global declarations done
  const globalDeclarationDone = await Declaration.query()
    .count()
    .where({ hasFinishedDeclaringEmployers: true });
  results.globalDeclarationsDone = globalDeclarationDone[0].count;

  // Declarations done by monthId
  results.declarationsDoneByMonth = await Declaration.query()
    .eager('declarationMonth')
    .select()
    .count('id')
    .where({ hasFinishedDeclaringEmployers: true })
    .groupBy('monthId')
    .orderBy('monthId');

  return res.json(results);
});

/**
 * Compute users registered during two periods of time
 */
// prettier-ignore
router.get('/metrics', async (req, res) => {
  const { firstMonthId, secondMonthId } = req.query;
  if (!firstMonthId) return res.send(400);

  const hasSecondPeriod = secondMonthId && secondMonthId !== firstMonthId;
  const results = {};

  // 1- Compute periods begin and en dates
  const firstDeclarationMonth = await DeclarationMonth.query().findById(firstMonthId);
  const secondDeclarationMonth = hasSecondPeriod
    ? await DeclarationMonth.query().findById(secondMonthId) : null;

  // Get longer period duration
  const firstPeriodDuration = differenceInCalendarDays(firstDeclarationMonth.endDate,
    firstDeclarationMonth.startDate);

  const secondPeriodDuration = hasSecondPeriod
    ? differenceInCalendarDays(secondDeclarationMonth.endDate,
      secondDeclarationMonth.startDate) : 0;
  const periodDuration = firstPeriodDuration > secondPeriodDuration
    ? firstPeriodDuration : secondPeriodDuration;

  // Compute periods start and end dates
  const startFirstPeriod = firstDeclarationMonth.startDate;
  const endFirstPeriod = addDays(firstDeclarationMonth.startDate, periodDuration);
  const startSecondPeriod = hasSecondPeriod ? secondDeclarationMonth.startDate : null;
  const endSecondPeriod = hasSecondPeriod
    ? addDays(secondDeclarationMonth.startDate, periodDuration) : null;

  // 2 - New users
  const newUsersFirstPeriodData = await User.query()
    .select(raw('to_char("registeredAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('registeredAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('registeredAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .groupByRaw('to_char("registeredAt", \'yyyy-mm-dd\')')
    .orderBy('date');

  const newUsersSecondPeriodData = hasSecondPeriod ? await User.query()
    .select(raw('to_char("registeredAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('registeredAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('registeredAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .groupByRaw('to_char("registeredAt", \'yyyy-mm-dd\')')
    .orderBy('date') : null;

  results.newUsers = formatQueryResults({
    startFirstPeriod,
    firstPeriodData: newUsersFirstPeriodData,
    startSecondPeriod,
    secondPeriodData: newUsersSecondPeriodData,
  });

  // 3 - Declarations started
  const declarationStartedFirstPeriodData = await Declaration.query()
    .select(raw('to_char("createdAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('createdAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .groupByRaw('to_char("createdAt", \'yyyy-mm-dd\')')
    .orderBy('date');

  const declarationStartedSecondPeriodData = hasSecondPeriod ? await Declaration.query()
    .select(raw('to_char("createdAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('createdAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .groupByRaw('to_char("createdAt", \'yyyy-mm-dd\')')
    .orderBy('date') : null;

  results.declarationStarted = formatQueryResults({
    startFirstPeriod,
    firstPeriodData: declarationStartedFirstPeriodData,
    startSecondPeriod,
    secondPeriodData: declarationStartedSecondPeriodData,
  });

  // 4 - Declarations finished for two periods of time
  const declarationFinishedFirstPeriodData = await ActivityLog.query()
    .select(raw('to_char("createdAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('createdAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_EMPLOYERS')
    .groupByRaw('to_char("createdAt", \'yyyy-mm-dd\')')
    .orderBy('date');

  const declarationFinishedSecondPeriodData = hasSecondPeriod ? await ActivityLog.query()
    .select(raw('to_char("createdAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('createdAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_EMPLOYERS')
    .groupByRaw('to_char("createdAt", \'yyyy-mm-dd\')')
    .orderBy('date') : null;

  results.declarationFinished = formatQueryResults({
    startFirstPeriod,
    firstPeriodData: declarationFinishedFirstPeriodData,
    startSecondPeriod,
    secondPeriodData: declarationFinishedSecondPeriodData,
  });

  // 5 - Files transmitted
  const filesTransmittedFirstPeriodData = await ActivityLog.query()
    .select(raw('to_char("createdAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('createdAt', '>', format(startFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endFirstPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_FILES')
    .groupByRaw('to_char("createdAt", \'yyyy-mm-dd\')')
    .orderBy('date');

  const filesTransmittedSecondPeriodData = hasSecondPeriod ? await ActivityLog.query()
    .select(raw('to_char("createdAt", \'yyyy-mm-dd\') as date, count(*)'))
    .where('createdAt', '>', format(startSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('createdAt', '<', format(endSecondPeriod, 'YYYY-MM-DD'))
    .andWhere('action', '=', 'VALIDATE_FILES')
    .groupByRaw('to_char("createdAt", \'yyyy-mm-dd\')')
    .orderBy('date') : null;

  results.filesTransmitted = formatQueryResults({
    startFirstPeriod,
    firstPeriodData: filesTransmittedFirstPeriodData,
    startSecondPeriod,
    secondPeriodData: filesTransmittedSecondPeriodData,
  });

  return res.json(results);
});

/**
 * Get repartion on all users in database (from the PeDump)
 * */
let peDumpUserRepartition = null;
let peDumpLastDate = null;
router.get('/repartition/global', async (req, res) => {
  if (peDumpLastDate && peDumpLastDate > subDays(new Date(), 1)) {
    return res.json(peDumpUserRepartition);
  }

  // Compute values
  peDumpUserRepartition = {
    agencies: {},
    regions: {},
    departments: {},
  };
  const users = await User.query();
  peDumpUserRepartition.franceTotal = users.length;

  users.forEach((user, i) => {
    if (!user.agencyCode && i > 100) return;

    const agency = getAgence(user.agencyCode);
    if (!agency) return;

    const { region, departement } = agency;

    // Region
    if (peDumpUserRepartition.regions[region] === undefined) {
      peDumpUserRepartition.regions[region] = 0;
    }
    peDumpUserRepartition.regions[region] += 1;

    // Department
    if (peDumpUserRepartition.departments[departement] === undefined) {
      peDumpUserRepartition.departments[departement] = 0;
    }
    peDumpUserRepartition.departments[departement] += 1;

    // Agencies
    if (peDumpUserRepartition.agencies[user.agencyCode] === undefined) {
      peDumpUserRepartition.agencies[user.agencyCode] = 0;
    }
    peDumpUserRepartition.agencies[user.agencyCode] += 1;
  });
  peDumpLastDate = new Date();

  return res.json(peDumpUserRepartition);
});

router.get('/repartition/region', async (req, res) => {
  const { region, monthId } = req.query;
  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400);
  }

  let agencies = [];
  try {
    agencies = getAllCodeAgencyFromRegionSlug(region);
  } catch {
    return res.send(400);
  }

  const declarations = await Declaration.query()
    .joinEager('user')
    .where({ monthId, hasFinishedDeclaringEmployers: true })
    .andWhere('user.agencyCode', 'in', agencies);

  return res.json(declarations);
});

/** Get all not registered users in a given region for propection purpose (in CSV) */
router.get('/repartition/unregistered-users-region/csv', async (req, res) => {
  const { region, monthId } = req.query;
  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400);
  }

  let agencies = [];
  try {
    agencies = getAllCodeAgencyFromRegionSlug(region);
  } catch {
    return res.send(400);
  }

  // Get all userId with a declaration in this region
  const declarations = await Declaration.query()
    .joinEager('user')
    .where({ monthId })
    .andWhere('user.agencyCode', 'in', agencies);
  const declarationsUserId = declarations.map((d) => d.userId);

  // Get all users ids in this regions
  const usersInRegion = await User.query().where('agencyCode', 'in', agencies);

  // Do diff
  const users = usersInRegion.filter(
    (usr) => !declarationsUserId.includes(usr.id),
  );

  const json2csvParser = new Parser({
    fields: [
      { label: 'Prenom', value: 'firstName' },
      { label: 'Nom', value: 'lastName' },
      { label: 'E-mail', value: 'email' },
      { label: 'Code postal', value: 'postalCode' },
    ],
  });

  const filename = `region-${region}-utilisateurs-non-enregistrés`;
  const csv = json2csvParser.parse(users);
  res.set(
    'Content-disposition',
    `attachment; filename=${filename}-${format(new Date(), 'YYYY-MM-DD')}.csv`,
  );
  res.set('Content-type', 'text/csv');
  return res.send(csv);
});

router.get('/repartition/department', async (req, res) => {
  const { department, monthId } = req.query;

  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400);
  }

  let agencies = [];
  try {
    agencies = getAllCodeAgencyFromDepartmentSlug(department);
  } catch {
    return res.send(400);
  }

  const declarations = await Declaration.query()
    .joinEager('user')
    .where({ monthId, hasFinishedDeclaringEmployers: true })
    .andWhere('user.agencyCode', 'in', agencies);

  return res.json(declarations);
});

router.get('/repartition/agency', async (req, res) => {
  const { agencyCode, monthId } = req.query;
  if (!agencyCode || Number.isNaN(+agencyCode)) return res.send(400);
  if (!monthId || Number.isNaN(+monthId)) {
    return res.send(400);
  }

  const declarations = await Declaration.query()
    .joinEager('user')
    .where({
      monthId,
      hasFinishedDeclaringEmployers: true,
      'user.agencyCode': agencyCode,
    });

  return res.json(declarations);
});

router.get('/repartition/agency/csv', async (req, res) => {
  const { filter, agencyCode, monthId } = req.query;

  // Validate fields
  if (!agencyCode || Number.isNaN(+agencyCode)) return res.send(400);
  if (!filter || !['actuDone', 'allUsers'].includes(filter)) {
    return res.send(400);
  }

  if (filter === 'actuDone' && (!monthId || Number.isNaN(+monthId))) {
    return res.send(400);
  }

  // Do queries
  let users;
  let filename;
  if (filter === 'allUsers') {
    users = await User.query().where({ agencyCode });
    filename = `demandeurs-agence-${agencyCode}`;
  } else {
    const declarations = await Declaration.query()
      .joinEager('user')
      .where({
        monthId,
        hasFinishedDeclaringEmployers: true,
        'user.agencyCode': agencyCode,
      });
    users = declarations.map((dec) => dec.user);
    filename = `actualisation-terminees-${agencyCode}`;
  }

  const json2csvParser = new Parser({
    fields: [
      { label: 'Prenom', value: 'firstName' },
      { label: 'Nom', value: 'lastName' },
      { label: 'E-mail', value: 'email' },
      { label: 'Code postal', value: 'postalCode' },
    ],
  });
  const csv = json2csvParser.parse(users);
  res.set(
    'Content-disposition',
    `attachment; filename=${filename}-${format(new Date(), 'YYYY-MM-DD')}.csv`,
  );
  res.set('Content-type', 'text/csv');
  return res.send(csv);
});

router.get('/retention', async (req, res) => {
  const { monthId } = req.query;

  if (!monthId || Number.isNaN(+monthId)) return res.send(400);

  /** 1- Retention global + by month */
  // Users who have done their first declaration in this period
  const userWithAlreadyADeclaration = await Declaration.query()
    .distinct('userId')
    .where('monthId', '<', monthId);
  const userIdsWithAlreadyADeclaration = userWithAlreadyADeclaration.map(
    (i) => i.userId,
  );

  const firstDeclarationsIds = await Declaration.query()
    .select('userId')
    .where('hasFinishedDeclaringEmployers', true)
    .where({ monthId })
    .whereNotIn('userId', userIdsWithAlreadyADeclaration)
    .groupBy('userId')
    .havingRaw('COUNT("userId") = 1');

  const declarationMonths = await DeclarationMonth.query()
    .andWhere('startDate', '<=', 'now')
    .andWhere('id', '>', monthId)
    .orderBy('id')
    .limit(6);

  const results = {
    baseUserNumber: firstDeclarationsIds.length,
    nextMonths: [],
  };

  // Extract only ids
  const ids = firstDeclarationsIds.map((i) => i.userId);

  // Users with at least one declaration in the next six month
  const oneDeclarationAtLeast = new Set();

  for (const m of declarationMonths) {
    // eslint-disable-next-line no-await-in-loop
    const users = await Declaration.query()
      .select('userId')
      .where('hasFinishedDeclaringEmployers', true)
      .where({ monthId: m.id })
      .whereIn('userId', ids);

    results.nextMonths.push({
      month: m.month,
      value: users.length,
    });

    const userIds = users.map((u) => u.userId);
    userIds.forEach((i) => oneDeclarationAtLeast.add(i));
  }

  // Users which have done at least one actualisation in the next 6 months
  results.oneDeclarationInSixMonths = oneDeclarationAtLeast.size;

  /** 2- Total of user who have done their declaration during the 24h after their first login on Zen  */
  const declarationMonth = await DeclarationMonth.query().findById(monthId);
  const firstLoginUserCount = await User.query()
    .count()
    .where('registeredAt', '>', declarationMonth.startDate)
    .andWhere('registeredAt', '<', declarationMonth.endDate);

  // Declaration 24h after their first login
  const startDeclarationLess24h = await Declaration.query()
    .joinRelation('user')
    .where({ monthId })
    .andWhere(
      'declarations.createdAt',
      '<',
      raw('"registeredAt" + interval \'1 day\''),
    );

  results.firstLoginUserCount = firstLoginUserCount[0].count;
  results.firstDeclarationLess24h = startDeclarationLess24h.length;
  results.employerFinishedDeclarationLess24h = startDeclarationLess24h.filter(
    (d) => d.hasFinishedDeclaringEmployers,
  ).length;
  results.validateAllFilesDeclarationLess24h = startDeclarationLess24h.filter(
    (d) => d.isFinished,
  ).length;

  /** 3 - User who have done their declaration - month by month */
  const declarationMonthsPossible = await DeclarationMonth.query()
    .andWhere('startDate', '<=', 'now')
    .andWhere('id', '>', monthId)
    .orderBy('id');

  const declarationMonthsId = declarationMonthsPossible.map((dc) => dc.id);
  const declarations = await Declaration.query()
    .select(raw('"userId", COUNT("userId") as "countDeclaration"'))
    .where('hasFinishedDeclaringEmployers', true)
    .whereIn('userId', ids)
    .whereIn('monthId', declarationMonthsId)
    .groupBy('userId')
    .orderByRaw('"countDeclaration"');

  const retentionByDeclarationCount = [];
  retentionByDeclarationCount[0] = ids.length - declarations.length;
  for (const declaration of declarations) {
    const { countDeclaration } = declaration;
    const value = retentionByDeclarationCount[countDeclaration] || 0;
    retentionByDeclarationCount[countDeclaration] = value + 1;
  }
  results.retentionByDeclarationCount = retentionByDeclarationCount;

  return res.json(results);
});

module.exports = router;
