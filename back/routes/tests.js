const express = require('express');
const {
  addWeeks,
  endOfMonth,
  startOfMonth,
  subWeeks,
  subMonths,
} = require('date-fns');

const User = require('../models/User');
const Declaration = require('../models/Declaration');
const Employer = require('../models/Employer');
const DeclarationMonth = require('../models/DeclarationMonth');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('This routes are ONLY meant for automatic testing purposes');
}

const router = express.Router();

const defaultFemaleUser = {
  firstName: 'Harry',
  lastName: 'Pisces',
  email: 'harry@pisces.com',
  gender: 'female',
  postalCode: '59160',
  peId: 'acbdefghi',
  needOnBoarding: false,
  needEmployerOnBoarding: false,
  registeredAt: '2019-04-16',
};

const defaultDeclaration = {
  userId: 1,
  hasWorked: true,
  hasTrained: false,
  hasInternship: false,
  hasSickLeave: false,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
  hasFinishedDeclaringEmployers: true,
  isFinished: false,
  createdAt: '2019-01-02T15:55:29.957Z',
  updatedAt: '2019-01-07T11:54:01.296Z',
  monthId: 8,
  isTransmitted: false,
  isEmailSent: false,
  isDocEmailSent: false,
};
const employer1 = {
  employerName: 'Marie',
  workHours: 232,
  salary: 41,
  hasEndedThisMonth: false,
  declarationId: 1,
};

const employer2 = {
  employerName: 'Paul',
  workHours: 23,
  salary: 34,
  hasEndedThisMonth: false,
  declarationId: 1,
};

const getBooleanValue = (str) => str.toLowerCase() === 'true';

const truncateDatabase = () =>
  User.knex().raw(
    `
      TRUNCATE
      "Users",
      activity_logs,
      declaration_infos,
      declaration_months,
      declaration_reviews,
      declarations,
      employer_documents,
      employers,
      session,
      status
      CASCADE
    `,
  );

const insertUser = (userOverride = {}) => {
  const user = {
    ...defaultFemaleUser,
    ...userOverride,
  };
  return User.query().insertAndFetch(user);
};

const insertDeclaration = ({
  userId,
  declarationMonthId,
  declarationOverride = {},
}) => {
  const declaration = {
    ...defaultDeclaration,
    ...declarationOverride,
  };
  declaration.userId = userId;
  declaration.monthId = declarationMonthId;

  return Declaration.query().upsertGraphAndFetch(declaration);
};

const insertEmployer = ({ employer, userId, declarationId }) => {
  employer.userId = userId;
  employer.declarationId = declarationId;
  return Employer.query().insertAndFetch(employer);
};

const insertDeclarationMonth = () =>
  DeclarationMonth.query().insert({
    month: new Date(),
    startDate: subWeeks(new Date(), 1),
    endDate: addWeeks(new Date(), 1),
  });

const insertOldAndCurrentDeclarationsMonths = async () => {
  // NOTE : order is important
  const m4 = await DeclarationMonth.query().insert({
    month: subMonths(new Date(), 3),
    startDate: subMonths(new Date(), 3),
    endDate: subMonths(new Date(), 4),
  });
  const m3 = await DeclarationMonth.query().insert({
    month: subMonths(new Date(), 2),
    startDate: subMonths(new Date(), 2),
    endDate: subMonths(new Date(), 3),
  });

  const m2 = await DeclarationMonth.query().insert({
    month: subMonths(new Date(), 1),
    startDate: subMonths(new Date(), 1),
    endDate: addWeeks(new Date(), 1),
  });
  const m1 = await DeclarationMonth.query().insert({
    month: new Date(),
    startDate: subWeeks(new Date(), 1),
    endDate: addWeeks(new Date(), 1),
  });

  return Promise.resolve([m1, m2, m3, m4]);
};

const setServiceUp = () =>
  User.knex().raw('INSERT INTO status (up) values (true)');

const fillSession = (req, user) => {
  req.isServiceUp = true;

  req.session.user = {
    ...user,
    isAuthorized:
      'authorizeUser' in req.query
        ? getBooleanValue(req.query.authorizeUser)
        : true,
    canSendDeclaration:
      'allowDeclaration' in req.query
        ? getBooleanValue(req.query.allowDeclaration)
        : true,
    hasAlreadySentDeclaration:
      'hasAlreadySentDeclaration' in req.query
        ? getBooleanValue(req.query.hasAlreadySentDeclaration)
        : false,
    tokenExpirationDate: '2059-05-06T13:34:15.985Z',
  };
  req.session.userSecret = {
    accessToken: 'abcde',
    idToken: 'fghij',
  };
};

router.post('/db/reset-for-signup', (req, res, next) => {
  truncateDatabase()
    .then(() =>
      Promise.all([insertUser(req.body.userOverride), setServiceUp()]))
    .then(([user]) => fillSession(req, user))
    .then(() => {
      req.isServiceUp = true; // Usefull ?
      res.json('ok');
    })
    .catch(next);
});

router.post('/db/set-empty', (req, res, next) => {
  truncateDatabase()
    .then(() => setServiceUp())
    .then(() => res.json('ok'))
    .catch(next);
});

router.post('/db/reset-for-actu-closed', (req, res, next) => {
  truncateDatabase()
    .then(() =>
      Promise.all([insertUser(req.body.userOverride), setServiceUp()]))
    .then(([user]) => {
      fillSession(req, user);
    })
    .then(() => {
      res.json('ok');
    })
    .catch(next);
});

router.post('/db/reset-for-files', (req, res, next) =>
  truncateDatabase()
    .then(() =>
      Promise.all([
        insertUser(req.body.userOverride),
        insertDeclarationMonth(),
        setServiceUp(),
      ]))
    .then(([user, declarationMonth]) => {
      fillSession(req, user);
      return insertDeclaration({
        userId: user.id,
        declarationMonthId: declarationMonth.id,
        declarationOverride: {
          hasSickLeave: true,
          infos: [
            {
              type: 'sickLeave',
              startDate: startOfMonth(declarationMonth.month),
              endDate: endOfMonth(declarationMonth.month),
            },
          ],
          ...req.body.declarationOverride,
        },
      });
    })
    .then((declaration) =>
      Promise.all([
        insertEmployer({
          employer: employer1,
          userId: declaration.userId,
          declarationId: declaration.id,
        }),
        insertEmployer({
          employer: employer2,
          userId: declaration.userId,
          declarationId: declaration.id,
        }),
      ]))
    .then(() => {
      res.json('ok');
    })
    .catch(next));

router.post('/db/reset-for-employers', (req, res, next) =>
  truncateDatabase()
    .then(() =>
      Promise.all([
        insertUser(req.body.userOverride),
        insertDeclarationMonth(),
        setServiceUp(),
      ]))
    .then(([user, declarationMonth]) => {
      fillSession(req, user);
      return insertDeclaration({
        userId: user.id,
        declarationMonthId: declarationMonth.id,
        declarationOverride: {
          hasFinishedDeclaringEmployers: false,
          ...req.body.declarationOverride,
        },
      });
    })
    .then(() => {
      res.json('ok');
    })
    .catch(next));

router.post('/db/reset-for-history', (req, res, next) =>
  truncateDatabase()
    .then(() =>
      Promise.all([
        insertUser(req.body.userOverride),
        insertOldAndCurrentDeclarationsMonths(),
        setServiceUp(),
      ]))

    .then(async ([user, declarationMonths]) => {
      fillSession(req, user);

      const declaration = await insertDeclaration({
        userId: user.id,
        declarationMonthId: declarationMonths[3].id,
        declarationOverride: {
          isFinished: false,
          hasSickLeave: true,
          infos: [
            {
              type: 'sickLeave',
              startDate: startOfMonth(declarationMonths[3].month),
              endDate: endOfMonth(declarationMonths[3].month),
            },
          ],
        },
      });
      await insertDeclaration({
        userId: user.id,
        declarationMonthId: declarationMonths[1].id,
      });

      return Promise.resolve(declaration);
    })
    .then((declaration) =>
      insertEmployer({
        employer: employer1,
        userId: declaration.userId,
        declarationId: declaration.id,
      }))
    .then(() => {
      res.json('ok');
    })
    .catch(next));

router.post('/db/reset', (req, res, next) =>
  truncateDatabase()
    .then(() =>
      Promise.all([
        insertUser(req.body.userOverride),
        insertDeclarationMonth(),
        setServiceUp(),
      ]))
    .then(([user]) => {
      fillSession(req, user);
      res.json('ok');
    })
    .catch(next));

module.exports = router;
