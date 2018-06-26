const { subMinutes } = require('date-fns')
const DeclarationMonth = require('../models/DeclarationMonth')

let value = null
let valueStoreDate = new Date(0)

// Only request activeMonth once every 10 minutes.
// set it in req.activeMonth
module.exports = (req, res, next) => {
  if (valueStoreDate > subMinutes(new Date(), 10)) {
    req.activeMonth = value
    return next()
  }

  DeclarationMonth.query()
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
