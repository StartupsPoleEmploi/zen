const express = require('express');
const zip = require('express-easy-zip');
const superagent = require('superagent');

const winston = require('../../lib/log');
const Status = require('../../models/Status');
const Declaration = require('../../models/Declaration');
const monthCtrl = require('../../controllers/monthCtrl');

const router = express.Router();
router.use(zip());

router.post('/settings/status-global', (req, res, next) =>
  Status.query()
    .patch({ up: req.body.up })
    .returning('*')
    .then((result) => {
      const message = `Suite à une action effectué dans l'interface d'administration, Zen est maintenant *${
        req.body.up ? 'activé' : 'désactivé'
      }*`;

      // No return for this promise : Slack being up or not should prevent us from sending back a 200
      superagent
        .post(process.env.SLACK_WEBHOOK_SU_ZEN, {
          text: message,
        })
        .catch((err) => winston.warn('Error sending message to Slack', err));

      return res.json(result[0]);
    })
    .catch(next));

router.post('/settings/status-files', (req, res, next) =>
  Status.query()
    .patch({ isFilesServiceUp: req.body.up })
    .returning('*')
    .then((result) => {
      const message = `Suite à une action effectué dans l'interface d'administration, l'envoi de justificatifs est *${
        req.body.up ? 'activé' : 'désactivé'
      }*`;

      // No return for this promise : Slack being up or not should prevent us from sending back a 200
      superagent
        .post(process.env.SLACK_WEBHOOK_SU_ZEN, {
          text: message,
        })
        .catch((err) => winston.warn('Error sending message to Slack', err));

      return res.json(result[0]);
    })
    .catch(next));

router.post('/settings/remove-declarations', async (req, res, next) => {
  if (['development', 'qa'].includes(process.env.NODE_ENV)) {
    const currentMonth = await monthCtrl.getCurrentMonth();
    const declarations = await Declaration.query().where('monthId', '=', currentMonth.id);

    await Promise.all(
      declarations.map(async (d) =>
        d.$query().delete()),
    ).then(() => res.json('OK'))
      .catch(next);
  } else {
    res.status(400).json('Only valid for development and qa env !');
  }
});

module.exports = router;
