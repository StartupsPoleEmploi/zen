const config = require('config');
const { isBefore, subMinutes, addMinutes } = require('date-fns');

const { clientId, clientSecret, tokenHost } = config;

const credentials = {
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    tokenHost,
    tokenPath: '/connexion/oauth2/access_token?realm=%2Findividu',
    authorizePath: '/connexion/oauth2/authorize',
  },
  options: {
    bodyFormat: 'form',
    authorizationMethod: 'body',
  },
};

// eslint-disable-next-line import/order
const oauth2 = require('simple-oauth2').create(credentials);
const winston = require('./log');

// We can refresh the session for 45 minutes after initial login
const MAX_DELAY_FOR_REFRESH = 45;

const isRefreshPossible = (loginDate) => {
  isBefore(new Date(), addMinutes(loginDate, MAX_DELAY_FOR_REFRESH));
};

// Check that the user token is valid (note: since we may need to do heavy operations
// we actually consider the token as invalid a full minute before it actually is.
const isUserTokenValid = (tokenExpiration) =>
  isBefore(new Date(), subMinutes(tokenExpiration, 1));

const refreshToken = (req) =>
  new Promise((resolve, reject) => {
    if (!req.session.userSecret) {
      return reject(new Error('No token'));
    }

    const token = oauth2.accessToken.create({
      access_token: req.session.userSecret.accessToken,
      refresh_token: req.session.userSecret.refreshToken,
    });

    return token
      .refresh()
      .then((authToken) => {
        req.session.user = {
          ...req.session.user,
          tokenExpirationDate: new Date(authToken.token.expires_at),
        };

        req.session.userSecret = {
          accessToken: authToken.token.access_token,
          refreshToken: authToken.token.refresh_token,
          idToken: authToken.token.id_token,
        };
        resolve();
      })
      .catch((err) => {
        winston.error('Error while refreshing access token', err.message);
        reject(new Error('Error while refreshing access token'));
      });
  });

module.exports = {
  isUserTokenValid,
  refreshToken,
  isRefreshPossible,
  credentials,
};
