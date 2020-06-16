/*
  These routes must ever ONLY be included in dev mode.
*/

const express = require('express');
const User = require('../models/User');
const DeclarationMonth = require('../models/DeclarationMonth');

const router = express.Router();

router.get('/session/user', (req, res) => {
  if (!req.session.userSecret) {
    // creating userSecret if it does not exist will avoid some errors if this mode is used,
    // as some routes require req.session.userSecret.accessToken, which is not useful
    // if using config bypasses
    req.session.userSecret = {};
  }

  res.json(req.session.user || {});
});

/*
    Security audits will use an URL to access to dev-Zen and can't do any login action.
    But by doing this, the robot will be always redirecting to the homepage...

    To avoid that, we handle an `connectedAs={ID}` parameter that, if added in the URL,
    will automatically connect user (with the given ID) and if there is no session yet.

    Ex: http://localhost/api/developer/fake-auth?connectedAs=6687&to=%2Ffiles
*/
router.get('/fake-auth', async (req, res) => {
  if (req.query.connectedAs) {
    const connectedAsId = Number(req.query.connectedAs);

    if (!Number.isNaN(connectedAsId)) {
      const currentId = req.session.user ? req.session.user.id : null;

      if (currentId !== connectedAsId) {
        const user = await User.query().findById(connectedAsId);
        if (!user) return res.send(`User with id ${connectedAsId} not found`);

        const {
          id, firstName, lastName, email, gender,
        } = user;

        req.session.user = {
          id,
          firstName,
          lastName,
          email,
          gender,
          isAuthorized: true,
          canSendDeclaration: true,
          hasAlreadySentDeclaration: false,
          tokenExpirationDate: new Date(1654719447626),
        };
      }
    }
  }

  return res.redirect(req.query.to ? decodeURIComponent(req.query.to) : '/');
});

router.post('/session/user', (req, res) => {
  req.session.user = req.body;
  res.json('ok');
});

router.get('/current-month', (req, res) =>
  DeclarationMonth.query()
    .where('startDate', '<=', 'now')
    .orderBy('startDate', 'DESC')
    .first()
    .then((month) => {
      if (!month) throw new Error('Current month not found.');
      return res.json(month);
    }));

router.post('/current-month', async (req, res) => {
  const { id, endDate } = req.body;
  await DeclarationMonth.query()
    .findById(id)
    .patch({ endDate });
  res.json('ok');
});

module.exports = router;
