const express = require('express')

const router = express.Router()
const crypto = require('crypto')
const config = require('config')
const { pick } = require('lodash')
const Raven = require('raven')

const User = require('../models/User')
const sendSubscriptionConfirmation = require('../lib/mailings/sendSubscriptionConfirmation')
const winston = require('../lib/log')
const { credentials } = require('../lib/token')
const mailjet = require('../lib/mailings/mailjet')
const userCtrl = require('../controllers/userCtrl')
const { REALM } = require('../constants')
// eslint-disable-next-line import/order
const oauth2 = require('simple-oauth2').create(credentials)

const { peConnectScope, redirectUri } = config
const tokenConfig = {
  redirect_uri: redirectUri,
  realm: REALM,
  scope: peConnectScope
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

router.get('/callback', async (req, res) => {
  try {
    if (req.session.state !== req.query.state || !req.query.code) {
      return res.redirect('/?loginFailed')
    }
    const authToken = await userCtrl.getAuthToken(
      req.query.code,
      req.session.nonce,
    )
    req.session.userSecret = {
      accessToken: authToken.token.access_token,
      refreshToken: authToken.token.refresh_token,
      idToken: authToken.token.id_token,
    }

    let {
      canSendDeclaration,
      hasAlreadySentDeclaration,
    } = await userCtrl.getActualisationStatus(authToken)
    const userinfo = await userCtrl.getUserinfo(authToken)
    let dbUser = await User.query().findOne({ peId: userinfo.peId })
    if (!dbUser) {
      // user is not in the DB, so the user is not acceptable (is not asking to "Asmat")
      // PS: we take all "Asmat" from datalake (view code on file /lib/importUserFromDatalake.js)
      // so we only insert the user into the DB and not Authorize him
      // NOTE: the user is not add to mailjet and doesn't receive any message
      const userToSave = {
        ...pick(userinfo, ['peId', 'email', 'firstName', 'lastName', 'gender']),
        postalCode: await userCtrl.getPostalCode(authToken),
        isAuthorized: false,
        registeredAt: new Date(),
      }
      dbUser = await User.query()
        .insert(userToSave)
        .returning('*')
      canSendDeclaration = false
      hasAlreadySentDeclaration = false
    } else {
      // the user is in DB, we get it from datalake file /lib/importUserFromDatalake.js
      // eslint-disable-next-line no-lonely-if
      if (!dbUser.registeredAt) {
        // first login, need to set registerAt
        if (config.get('shouldSendTransactionalEmails') && dbUser.email) {
          // Note: We do not wait for Mailjet to answer to send data back to the user
          mailjet.addUser(dbUser).then(() => {
            if (dbUser.isAuthorized) return sendSubscriptionConfirmation(dbUser);
          }).catch((e) => {
            winston.error('[Login] error when add user to mailjet and send it the confirmation email', e);
          })
          
        }
        dbUser = await dbUser
          .$query()
          .patch({ registeredAt: new Date() })
          .returning('*')
      }
    }

    req.session.user = {
      ...pick(dbUser, ['id', 'firstName', 'lastName', 'email', 'gender']),
      isAuthorized: config.authorizeAllUsers // For test environments
        ? true
        : dbUser.isAuthorized,
      isBlocked: dbUser.isBlocked,
      canSendDeclaration,
      hasAlreadySentDeclaration,
      tokenExpirationDate: new Date(authToken.token.expires_at),
      loginDate: new Date(),
    }
    res.redirect('/')
  } catch (err) {
    res.redirect('/?loginFailed')
    winston.error(`Error at login while requesting pe api ${err.message}`, err)
    return Raven.captureException(err)
  }
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
