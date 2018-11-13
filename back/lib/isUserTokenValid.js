const { isBefore, subMinutes } = require('date-fns')

// Check that the user token is valid (note: since we may need to do heavy operations
// we actually consider the token as invalid a full minute before it actually is.
module.exports = (tokenExpiration) =>
  isBefore(new Date(), subMinutes(tokenExpiration, 1))
