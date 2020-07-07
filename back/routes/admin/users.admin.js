const express = require('express');
const { format } = require('date-fns');
const zip = require('express-easy-zip');
const { Parser } = require('json2csv');

const { deleteUser } = require('../../lib/user');
const { computeFields, DATA_EXPORT_FIELDS } = require('../../lib/exportUserList');

const DeclarationMonth = require('../../models/DeclarationMonth');
const User = require('../../models/User');

const router = express.Router();
router.use(zip());

router.get('/users', async (req, res, next) => {
  const isAuthorized = req.query.authorized === 'true';

  try {
    const users = await User.query()
      .where({ isAuthorized })
      .whereNotNull('registeredAt');
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get('/users/csv', async (req, res, next) => {
  const isAuthorized = req.query.authorized === 'true';

  try {
    const users = await User.query()
      .withGraphFetched('[declarations.[declarationMonth], activityLogs]')
      .where({ isAuthorized })
      .whereNotNull('registeredAt');

    const months = await DeclarationMonth.query()
      .where('startDate', '<=', 'now')
      .orderBy('startDate', 'DESC');

    const json2csvParser = new Parser({
      fields: isAuthorized ? computeFields(months) : DATA_EXPORT_FIELDS,
    });
    const csv = json2csvParser.parse(users);

    res.set(
      'Content-disposition',
      `attachment; filename=utilisateurs-${
        !isAuthorized ? 'non-' : ''
      }autorisés-${format(new Date(), 'yyyy-MM-dd')}.csv`,
    );
    res.set('Content-type', 'text/csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

// get users *not* in db
router.post('/users/filter', (req, res, next) => {
  let emails;
  try {
    emails = req.body.emails.map((email) => email.toLowerCase());
  } catch (err) {
    return next(err);
  }

  const query = User.query().whereNotNull('registeredAt');

  query.where(function where() {
    this.where('email', 'ilike', emails[0]);
    emails.slice(1).forEach((email) => {
      this.orWhere('email', 'ilike', email);
    });
  });

  return query
    .then((usersInDb) => {
      const usersInDbEmails = usersInDb.map(({ email }) => email.toLowerCase());
      return res.json(
        emails.filter((email) => !usersInDbEmails.includes(email)),
      );
    })
    .catch(next);
});

router.delete('/delete-user', (req, res, next) => {
  const { userId } = req.query;
  if (!userId) throw new Error('No user id given');

  User.query()
    .withGraphFetched('[employers.documents, declarations.[infos,review]]')
    .findById(userId)
    .then((user) => {
      if (!user) throw new Error('No such user id');
      return deleteUser(user);
    })
    .then(() => res.send('ok'))
    .catch(next);
});

router.get('/users/:id', (req, res, next) => {
  User.query()
    .withGraphFetched('[activityLogs, declarations.[infos, review, employers.documents]]')
    .findById(req.params.id)
    .then((user) => {
      if (!user) return res.send(404, 'User not found');
      return res.json(user);
    })
    .catch(next);
});

module.exports = router;
