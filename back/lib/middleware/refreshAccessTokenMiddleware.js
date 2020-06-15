const {
  isUserTokenValid,
  refreshToken,
  isRefreshPossible,
} = require('../token');

const refreshAccessToken = (req, res, next) => {
  if (!req.user || !req.user.tokenExpirationDate || !req.user.loginDate) {
    return next();
  }

  if (isUserTokenValid(req.user.tokenExpirationDate)) return next();
  if (!isRefreshPossible(req.user.loginDate)) return next();
  refreshToken(req).finally(next);
};

module.exports = {
  refreshAccessToken,
};
