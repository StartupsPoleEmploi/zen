const {
  isUserTokenValid,
  refreshToken,
  isRefreshPossible,
} = require('../lib/token')

const refreshAccessToken = (req, res, next) => {
  if (isUserTokenValid(req.user.tokenExpirationDate)) return next()
  if (!isRefreshPossible(req.user.tokenExpirationDate)) return next()
  refreshToken(req).finally(next)
}

module.exports = {
  refreshAccessToken,
}
