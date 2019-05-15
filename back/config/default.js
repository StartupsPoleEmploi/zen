module.exports = {
  clientId: process.env.CLIENT_OAUTH_ID,
  clientSecret: process.env.CLIENT_OAUTH_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  redirectUri: process.env.AUTH_REDIRECT_URI,
  tokenHost: process.env.TOKEN_HOST,
  apiHost: process.env.API_HOST,
  appHost: process.env.APP_HOST,
  // pm2-dev has a bug which prevents the env to be the same in dev.
  // should be the same ASAP.
  // https://github.com/Unitech/pm2/issues/3158
  uploadsDirectory: '/home/back/uploads/',
  uploadsDeclarationDirectory: '/home/back/uploads/declarations/',
  shouldSendCampaignEmails: process.env.SEND_CAMPAIGN_EMAILS === 'true',
  shouldSendTransactionalEmails:
    process.env.SEND_TRANSACTIONAL_EMAILS === 'true',
  authorizeAllUsers: process.env.AUTHORIZE_ALL_USERS === 'true',
  // The following 2 values should never be activated out of local development
  // they are only listed here as an information of their existence.
  bypassDeclarationDispatch: false,
  bypassDocumentsDispatch: false,
}
