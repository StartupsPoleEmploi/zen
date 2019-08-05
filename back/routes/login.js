const express = require('express')

const router = express.Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('config')
const { pick, startCase, toLower } = require('lodash')
const Raven = require('raven')

const User = require('../models/User')
const { changeContactEmail } = require('../lib/mailings/mailjet')
const sendSubscriptionConfirmation = require('../lib/mailings/sendSubscriptionConfirmation')
const winston = require('../lib/log')
const { request } = require('../lib/resilientRequest')

const { clientId, clientSecret, redirectUri, tokenHost, apiHost } = config
const { DECLARATION_STATUSES } = require('../constants')

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

// eslint-disable-next-line import/order
const oauth2 = require('simple-oauth2').create(credentials)

const tokenConfig = {
  redirect_uri: redirectUri,
  realm,
  scope: `application_${clientId} api_peconnect-individuv1 openid profile email api_peconnect-coordonneesv1 coordonnees api_peconnect-actualisationv1 individu api_peconnect-envoidocumentv1 document documentW`,
}

router.get('/', (req, res, next) => {
  req.session.regenerate((err) => {
    if (err) return next(err)

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
})

router.get('/callback', (req, res) => {
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
      if (tokenClaims.azp && tokenClaims.azp !== clientId) {
        throw new Error('Wrong azp')
      }
      if (tokenClaims.realm !== realm) throw new Error('Wrong realm')
      if (tokenClaims.nonce !== req.session.nonce) {
        throw new Error('Wrong nonce')
      }

      // https://www.emploi-store-dev.fr/portail-developpeur-cms/home/catalogue-des-api/documentation-des-api/utiliser-les-api/authorization-code-flow/securite-et-verification.html
      // TODO check access_token against at_hash here - possible code:
      // base64url(crypto.createHash('sha256').update(authToken.token.access_token).digest('hex'))

      req.session.userSecret = {
        accessToken: authToken.token.access_token,
        idToken: authToken.token.id_token,
      }

      return authToken
    })
    .then((authToken) =>
      Promise.all([
        request({
          method: 'get',
          url: `${apiHost}/partenaire/peconnect-individu/v1/userinfo`,
          accessToken: authToken.token.access_token,
        }),
        request({
          method: 'get',
          url: `${apiHost}/partenaire/peconnect-actualisation/v1/actualisation`,
          accessToken: authToken.token.access_token,
        }),
        request({
          method: 'get',
          url: `${apiHost}/partenaire/peconnect-coordonnees/v1/coordonnees`,
          accessToken: authToken.token.access_token,
        }),
        new Date(authToken.token.expires_at),
      ]),
    )
    .then(
      ([
        { body: userinfo },
        { body: declarationData },
        { body: coordinates },
        tokenExpirationDate,
      ]) => {
        // We only allow declarations when we have this status code
        // (yes, it doesn't seem to make sense, but that's what the API
        // gives us when the declaration hasn't been done yet)
        const canSendDeclaration =
          declarationData.statut ===
          DECLARATION_STATUSES.IMPOSSIBLE_OR_UNNECESSARY
        const hasAlreadySentDeclaration =
          declarationData.statut === DECLARATION_STATUSES.SAVED

        const userToSave = {
          peId: userinfo.sub,
          firstName: startCase(toLower(userinfo.given_name)),
          lastName: startCase(toLower(userinfo.family_name)),
          gender: userinfo.gender,
          postalCode: coordinates.codePostal,
        }
        // If no email is communicated by PE, do not override email
        if (userinfo.email) {
          userToSave.email = userinfo.email
        }
        return User.query()
          .findOne({ peId: userToSave.peId })
          .then((dbUser) => {
            if (dbUser) {
              if (!!dbUser.email && dbUser.email !== userToSave.email) {
                winston.info(`E-mail changed for user ${dbUser.id}`)
                // User email has changed. Changing email in mailjet
                // Note: We do not wait for Mailjet to answer to send data back to the user
                changeContactEmail({
                  oldEmail: dbUser.email,
                  newEmail: userToSave.email,
                }).catch((e) => Raven.captureException(e))
              }

              return dbUser
                .$query()
                .update(userToSave)
                .returning('*')
            }

            return User.query()
              .insert(userToSave)
              .returning('*')
              .then((savedUser) => {
                // This is a new user. Sending them an email.
                if (
                  config.get('shouldSendTransactionalEmails') &&
                  userToSave.email
                ) {
                  // Note: We do not wait for Mailjet to answer to send data back to the user
                  sendSubscriptionConfirmation(userToSave).catch((e) =>
                    Raven.captureException(e),
                  )
                }

                return savedUser
              })
          })
          .then((user) => {
            req.session.user = {
              ...pick(user, ['id', 'firstName', 'lastName', 'email', 'gender']),
              isAuthorized: config.authorizeAllUsers // For test environments
                ? true
                : user.isAuthorized,
              canSendDeclaration,
              hasAlreadySentDeclaration,
              tokenExpirationDate,
            }
            res.redirect('/')
          })
      },
    )
    .catch((err) => {
      res.redirect('/?loginFailed')
      winston.error('Error at login while requesting pe api', err.message)
      return Raven.captureException(err)
    })
})

router.get('/logout', (req, res) => {
  // This is a path required by the user's browser, hence the redirection
  const { idToken } = req.session.userSecret || {}
  req.session.destroy((err) => {
    if (err) Raven.captureException(err)
  })
  res.redirect(
    `${config.tokenHost}/compte/deconnexion/compte/deconnexion?id_token_hint=${idToken}&redirect_uri=${config.appHost}`,
  )
})

module.exports = router
