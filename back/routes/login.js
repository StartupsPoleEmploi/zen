const express = require('express')

const router = express.Router()
const crypto = require('crypto')
const superagent = require('superagent')
const jwt = require('jsonwebtoken')
const config = require('config')
const { pick, startCase, toLower } = require('lodash')

const User = require('../models/User')

const { clientId, clientSecret, redirectUri, tokenHost, apiHost } = config

const realm = '/individu'

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
}

const oauth2 = require('simple-oauth2').create(credentials)

const tokenConfig = {
  redirect_uri: redirectUri,
  realm,
  scope: `application_${clientId} api_peconnect-individuv1 openid profile email api_peconnect-coordonneesv1 coordonnees`,
}

router.get('/', (req, res) => {
  const state = crypto.randomBytes(64).toString('hex')
  const nonce = crypto.randomBytes(64).toString('hex')

  req.session.state = state
  req.session.nonce = nonce

  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    ...tokenConfig,
    nonce,
    state,
  })

  res.redirect(authorizationUri)
})

router.get('/callback', (req, res, next) => {
  if (req.session.state !== req.query.state || !req.query.code) {
    return res.redirect('/?loginFailed')
  }

  oauth2.authorizationCode
    .getToken({
      redirect_uri: redirectUri,
      code: req.query.code,
    })
    .then((result) => oauth2.accessToken.create(result))
    .then((authToken) => {
      const tokenClaims = jwt.decode(authToken.token.id_token)

      if (!tokenClaims.iss.startsWith(tokenHost)) throw new Error('Wrong iss')
      if (tokenClaims.aud !== clientId) throw new Error('Wrong aud')
      if (tokenClaims.azp && tokenClaims.azp !== clientId)
        throw new Error('Wrong azp')
      if (tokenClaims.realm !== realm) throw new Error('Wrong realm')
      if (tokenClaims.nonce !== req.session.nonce)
        throw new Error('Wrong nonce')

      // https://www.emploi-store-dev.fr/portail-developpeur-cms/home/catalogue-des-api/documentation-des-api/utiliser-les-api/authorization-code-flow/securite-et-verification.html
      // TODO check access_token against at_hash here - possible code:
      // base64url(crypto.createHash('sha256').update(authToken.token.access_token).digest('hex'))

      return authToken
    })
    .then((authToken) =>
      Promise.all([
        superagent
          .get(`${apiHost}/partenaire/peconnect-individu/v1/userinfo`)
          .set('Authorization', `Bearer ${authToken.token.access_token}`),
        superagent
          .get(`${apiHost}/partenaire/peconnect-coordonnees/v1/coordonnees`)
          .set('Authorization', `Bearer ${authToken.token.access_token}`),
      ]),
    )
    .then(([{ body: userinfo }, { body: coordinates }]) => {
      const user = {
        peId: userinfo.sub,
        email: toLower(userinfo.email),
        firstName: startCase(toLower(userinfo.given_name)),
        lastName: startCase(toLower(userinfo.family_name)),
        pePostalCode: coordinates.codePostal,
      }
      return User.query()
        .findOne({ peId: user.peId })
        .then((dbUser) => {
          if (dbUser) {
            return dbUser
              .$query()
              .update(user)
              .returning('*')
          }

          return User.query()
            .insert(user)
            .returning('*')
        })
    })
    .then((user) => {
      req.session.user = {
        ...pick(user, ['id', 'firstName', 'lastName', 'email']),
        isAuthorizedForTests:
          !!user.peCode && !!user.pePass && !!user.pePostalCode,
      }
      req.user = req.session.user // For sentry reporting
      res.redirect('/')
    })
    .catch(next)
})

module.exports = router
