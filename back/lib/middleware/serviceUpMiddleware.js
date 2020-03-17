const { subSeconds } = require('date-fns')
const Status = require('../../models/Status')

let serviceUp = null
let filesServiceUp = null
let valueStoreDate = new Date(0)

// Only request isServiceUp once every 5 seconds.
// set it in req.isServiceUp
const setIsServiceUp = (req, res, next) => {
  if (valueStoreDate > subSeconds(new Date(), 5)) {
    req.isServiceUp = serviceUp
    req.isFilesServiceUp = filesServiceUp
    return next()
  }

  return Status.query()
    .first()
    .then((status) => {
      serviceUp = status.up
      filesServiceUp = status.isFilesServiceUp
      valueStoreDate = new Date()

      req.isServiceUp = status.up
      req.isFilesServiceUp = status.isFilesServiceUp
      next()
    })
    .catch(() => {
      req.isServiceUp = false
      req.isFilesServiceUp = false
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
