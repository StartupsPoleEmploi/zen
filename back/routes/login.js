var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const superagent = require('superagent')

const clientId = process.env.CLIENT_OAUTH_ID
const clientSecret = process.env.CLIENT_OAUTH_SECRET

const redirectUri = 'http://localhost:8080/login/callback'

const credentials = {
  client: {
    id: clientId,
    secret: clientSecret
  },
  auth: {
    tokenHost: 'https://authentification-candidat.pole-emploi.fr',
    tokenPath: '/connexion/oauth2/access_token?realm=%2Findividu',
    authorizePath: '/connexion/oauth2/authorize'
  },
  options: {
    bodyFormat: 'form',
    authorizationMethod: 'body'
  }
}

// Initialize the OAuth2 Library
const oauth2 = require('simple-oauth2').create(credentials);

const tokenConfig = {
  redirect_uri: redirectUri,
  realm: '/individu',
  scope: `application_${clientId} api_peconnect-individuv1 openid profile email`
}

const authorizationUri = oauth2.authorizationCode.authorizeURL({
  ...tokenConfig,
  nonce: crypto.randomBytes(64).toString('hex'),
  state: crypto.randomBytes(64).toString('hex'),
});


router.get('/', function(req, res, next) {
  res.redirect(authorizationUri);
});

router.get('/callback', (req, res, next) => (
  oauth2.authorizationCode.getToken({
    redirect_uri: redirectUri,
    code: req.query.code
  })
  .then((result) => oauth2.accessToken.create(result))
  .then((authToken) => superagent
    .get(`https://api.emploi-store.fr/partenaire/peconnect-individu/v1/userinfo`)
    .set('Authorization', `Bearer ${authToken.token.access_token}`)
  )
  .then(result => {
    console.log(res.body, res.status)
    res.status(200).json(result.body)
  })
  .catch(error => {
    console.error(error)
    res.status(500).json('Authentication failed')
  })
))

module.exports = router;
