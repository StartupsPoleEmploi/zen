const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const superagent = require('superagent')
const jwt = require('jsonwebtoken')

const clientId = process.env.CLIENT_OAUTH_ID
const clientSecret = process.env.CLIENT_OAUTH_SECRET

const redirectUri = 'http://localhost:8080/login/callback'
const tokenHost = 'https://authentification-candidat.pole-emploi.fr'
const realm = '/individu'

const credentials = {
  client: {
    id: clientId,
    secret: clientSecret
  },
  auth: {
    tokenHost,
    tokenPath: '/connexion/oauth2/access_token?realm=%2Findividu',
    authorizePath: '/connexion/oauth2/authorize'
  },
  options: {
    bodyFormat: 'form',
    authorizationMethod: 'body'
  }
}

const oauth2 = require('simple-oauth2').create(credentials);

const tokenConfig = {
  redirect_uri: redirectUri,
  realm,
  scope: `application_${clientId} api_peconnect-individuv1 openid profile email`
}

const authorizationUri = oauth2.authorizationCode.authorizeURL({
  ...tokenConfig,
  nonce: crypto.randomBytes(64).toString('hex'),
  state: crypto.randomBytes(64).toString('hex'),
});


router.get('/', function(req, res, next) {
  // TODO save state and nonce in session here

  const state = crypto.randomBytes(64).toString('hex')
  const nonce = crypto.randomBytes(64).toString('hex')

  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    ...tokenConfig,
    nonce,
    state,
  });

  res.redirect(authorizationUri);
});

router.get('/callback', (req, res, next) => {
  // TODO compare req.query state with session state here

  oauth2.authorizationCode.getToken({
    redirect_uri: redirectUri,
    code: req.query.code
  })
  .then((result) => oauth2.accessToken.create(result))
  .then((authToken) => {
    const tokenClaims = jwt.decode(authToken.token.id_token)

    if (!tokenClaims.iss.startsWith(tokenHost)) throw new Error('Wrong iss')
    if (tokenClaims.aud !== clientId) throw new Error('Wrong aud')
    if (tokenClaims.azp && tokenClaims.azp !== clientId) throw new Error('Wrong azp')
    if (tokenClaims.realm !== realm) throw new Error('Wrong realm')

    // https://www.emploi-store-dev.fr/portail-developpeur-cms/home/catalogue-des-api/documentation-des-api/utiliser-les-api/authorization-code-flow/securite-et-verification.html
    // TODO check nonce here
    // TODO check access_token against at_hash here - possible code:
    // base64url(crypto.createHash('sha256').update(authToken.token.access_token).digest('hex'))

    return authToken
  })
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
})

module.exports = router;
