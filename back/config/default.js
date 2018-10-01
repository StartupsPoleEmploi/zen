module.exports = {
  clientId: process.env.CLIENT_OAUTH_ID,
  clientSecret: process.env.CLIENT_OAUTH_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  redirectUri: process.env.AUTH_REDIRECT_URI,
  tokenHost: 'https://authentification-candidat.pole-emploi.fr',
  apiHost: 'https://api.emploi-store.fr',
  // pm2-dev has a bug which prevents the env to be the same in dev.
  // should be the same ASAP.
  // https://github.com/Unitech/pm2/issues/3158
  uploadsDirectory:
    process.env.NODE_ENV === 'production'
      ? '/home/back/uploads/'
      : '/tmp/uploads/',
  shouldSendCampaignEmails: process.env.SEND_CAMPAIGN_EMAILS === 'true',
  shouldSendTransactionalEmails:
    process.env.SEND_TRANSACTIONAL_EMAILS === 'true',
  shouldTransmitDataToPE: process.env.TRANSMIT_DATA_TO_PE === 'true',
}
