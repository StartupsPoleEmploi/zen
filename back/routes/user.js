const express = require('express');
const config = require('config');

const { isUserTokenValid } = require('../lib/token');
const {
  refreshAccessToken,
} = require('../lib/middleware/refreshAccessTokenMiddleware');
const mailjet = require('../lib/mailings/mailjet');
const winston = require('../lib/log');
const { isPro } = require('../lib/user');
const sendSubscriptionConfirmation = require('../lib/mailings/sendSubscriptionConfirmation');
const User = require('../models/User');
const ConseillersHelpQuery = require('../models/ConseillersHelpQuery');

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const router = express.Router();

router.get('/', refreshAccessToken, async (req, res) => {
  const dbUser = await User.query().findOne({ id: req.session.user.id });

  if (!dbUser) {
    return res.status(401).json('Unauthorized');
  }

  return res.json({
    isBlocked: dbUser.isBlocked,
    needOnBoarding: dbUser.needOnBoarding,
    needEmployerOnBoarding: dbUser.needEmployerOnBoarding,
    registeredAt: dbUser.registeredAt,
    ...req.session.user,
    csrfToken: req.csrfToken && req.csrfToken(),
    isTokenValid: isUserTokenValid(req.session.user.tokenExpirationDate),
  });
});

// Based on : https://github.com/StartupsPoleEmploi/labonneboite/blob/master/labonneboite/common/pro.py
router.get('/is-pro', (req, res) => {
  const isUserPro = isPro(req);

  return res
    .status(200)
    .json({ status: isUserPro ? 'Authorized' : 'Unauthorized' });
});

// Based on : https://github.com/StartupsPoleEmploi/labonneboite/blob/master/labonneboite/common/pro.py
router.post('/save-email', async (req, res) => {
  const isUserPro = isPro(req);
  if (!isUserPro) return res.send(400);

  const { email } = req.body;
  if (
    !email
    || !EMAIL_REGEX.test(email)
    || !email.endsWith('@pole-emploi.fr')
  ) {
    return res.send(400);
  }
  try {
    await ConseillersHelpQuery.query().insert({ email });
  } catch (err) {
    return res.send(400);
  }

  return res.send(200);
});

// Set needOnBoarding to false
router.post('/disable-need-on-boarding', (req, res, next) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json('Unauthorized');
  }

  return User.query()
    .findOne({ id: req.session.user.id })
    .then((user) => {
      if (!user) throw new Error('No such user');

      return user
        .$query()
        .patch({
          needOnBoarding: false,
        })
        .then(() => {
          req.session.user.needOnBoarding = false;
          return res.json(req.session.user);
        });
    })
    .catch(next);
});

// Set needEmployerOnBoarding to false
router.post('/disable-need-employer-on-boarding', (req, res, next) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json('Unauthorized');
  }

  return User.query()
    .findOne({ id: req.session.user.id })
    .then((user) => {
      if (!user) throw new Error('No such user');

      return user
        .$query()
        .patch({
          needEmployerOnBoarding: false,
        })
        .then(() => {
          req.session.user.needEmployerOnBoarding = false;
          return res.json(req.session.user);
        });
    })
    .catch(next);
});

router.patch('/', (req, res, next) => {
  // This is only intended to let an user add his email,
  // not modify it.
  if (!req.session.user || !req.session.user.id || req.session.user.email) {
    return res.status(401).json('Unauthorized');
  }

  return User.query()
    .findOne({ id: req.session.user.id })
    .then((user) => {
      if (!user) throw new Error('No such user');

      // We do not allow overriding previously obtained info.
      return user.$query().patchAndFetch({
        email: req.body.email,
      });
    })
    .then((user) => {
      if (config.get('shouldSendTransactionalEmails')) {
        // Note: We do not wait for Mailjet to answer to send data back to the user
        mailjet
          .addUser(user)
          .then(() => {
            if (user.isAuthorized) return sendSubscriptionConfirmation(user);
          })
          .catch((e) => {
            winston.error(
              '[AddEmail] error when add user to mailjet and send it the confirmation email',
              e,
            );
          });
      }
      req.session.user.email = user.email;
      res.json(req.session.user);
    })
    .catch(next);
});

module.exports = router;
