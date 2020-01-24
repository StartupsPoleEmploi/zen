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
  // fill in local-* config file with an email if ever needed to test emails out of prod env
  testEmail: '',
  // The following 2 values should never be activated out of local development
  // they are only listed here as an information of their existence.
  bypassDeclarationDispatch: false,
  bypassDocumentsDispatch: false,

  // scops get from https://www.emploi-store-dev.fr/
  peConnectScope: [
    // API => Se connecter avec Pôle emploi - V1
    'api_peconnect-individuv1',
    `application_${process.env.CLIENT_OAUTH_ID}`,
    'qos_silver_peconnect-individuv1',
    'openid',
    'profile',
    'email',

    // API => Coordonnées v1
    'api_peconnect-coordonneesv1',
    'qos_gold_peconnect-coordonneesv1',
    'coordonnees',

    // API => Envoi document ZEN - V1
    'api_peconnect-envoidocumentv1',
    'document',
    'documentW',

    // API => Actualisation ZEN - V1
    'api_peconnect-actualisationv1',
    'qos_gold_peconnect-actualisationv1',
    'individu',
  ].join(' ')
}
