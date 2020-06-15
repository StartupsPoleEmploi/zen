const express = require('express');
const DeclarationMonth = require('../models/DeclarationMonth');

const router = express.Router();

router.get('/', (req, res) => {
  if (!('active' in req.query)) return res.status(400).json('Route not ready');
  res.json((req.activeMonth && req.activeMonth.month) || null);
});

router.get('/next-declaration-month', (req, res) =>
  DeclarationMonth.query()
    .select(['month', 'startDate', 'endDate'])
    .where('endDate', '>', 'now')
    .andWhere('startDate', '>', 'now')
    .orderBy('startDate')
    .first()
    .then((month) => {
      if (!month) throw new Error('Next declaration month not found.');
      return res.json(month);
    }));

router.get('/current-declaration-month', (req, res) =>
  DeclarationMonth.query()
    .select(['month', 'startDate', 'endDate'])
    .where('endDate', '>', 'now')
    .andWhere('startDate', '<=', 'now')
    .first()
    .then((month) => {
      if (!month) throw new Error('Current declaration month not found.');
      return res.json(month);
    }));

router.get('/finished', (req, res) =>
  DeclarationMonth.query()
    .select(['id', 'month'])
    .where('startDate', '<', 'now')
    .orderBy('id', 'desc')
    .then((months) => res.json(months)));

module.exports = router;
