const { subMinutes } = require('date-fns');
const DeclarationMonth = require('../../models/DeclarationMonth');

const isTestEnv = process.env.NODE_ENV === 'test';

let value = null;
let valueStoreDate = new Date(0);

// Only request activeMonth once every 1 minute.
// set it in req.activeMonth
const setActiveMonth = (req, res, next) => {
  if (valueStoreDate > subMinutes(new Date(), 1) && !isTestEnv) {
    req.activeMonth = value;
    return next();
  }

  return DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first()
    .then((activeMonth) => {
      value = activeMonth;
      valueStoreDate = new Date();

      req.activeMonth = activeMonth;
      next();
    });
};

const requireActiveMonth = (req, res, next) => {
  if (!req.activeMonth) {
    return res.status(503).json('Service unavailable (no active month)');
  }
  next();
};

module.exports = {
  requireActiveMonth,
  setActiveMonth,
};
