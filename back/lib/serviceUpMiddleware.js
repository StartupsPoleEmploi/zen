const { subMinutes } = require('date-fns')
const Status = require('../models/Status')

let value = null
let valueStoreDate = new Date(0)

// Only request isServiceUp once every 1 minute.
// set it in req.isServiceUp
const setIsServiceUp = (req, res, next) => {
  if (valueStoreDate > subMinutes(new Date(), 1)) {
    req.isServiceUp = value
    return next()
  }

  return Status.query()
    .first()
    .then((status) => {
      value = status.up
      valueStoreDate = new Date()

      req.isServiceUp = status.up
      next()
    })
}

const requireServiceUp = (req, res, next) => {
  if (!req.isServiceUp) {
    return res.status(503).json('Service unavailable (currently down)')
  }
  next()
}

module.exports = {
  requireServiceUp,
  setIsServiceUp,
}
