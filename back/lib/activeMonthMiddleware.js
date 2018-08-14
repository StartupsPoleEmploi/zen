const { subMinutes } = require('date-fns')
const DeclarationMonth = require('../models/DeclarationMonth')

let value = null
let valueStoreDate = new Date(0)

// Only request activeMonth once every 1 minute.
// set it in req.activeMonth
module.exports = (req, res, next) => {
  if (valueStoreDate > subMinutes(new Date(), 1)) {
    req.activeMonth = value
    return next()
  }

  return DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first()
    .then((activeMonth) => {
      value = activeMonth
      valueStoreDate = new Date()

      req.activeMonth = activeMonth
      next()
    })
}
