const jwt = require('jsonwebtoken')
const config = require('config')
const { startCase, toLower } = require('lodash')
const Raven = require('raven')

const winston = require('../lib/log')
const { request } = require('../lib/resilientRequest')
const { DECLARATION_STATUSES, REALM } = require('../constants')
const DEPARTMENTS_AUTORIZED = require('../constants/departmentsAutorized')
const { credentials } = require('../lib/token')
const Declaration = require('../models/Declaration')
const User = require('../models/User')
// eslint-disable-next-line import/order
const oauth2 = require('simple-oauth2').create(credentials)

const { clientId, redirectUri, tokenHost, apiHost } = config

/**
 * @desc get user info from "peconnect-individu"
 * @param {string} code from req.query.code
 * @param {string} nonce from req.session.nonce
 * @returns {Promise<{peId: string, email: string, firstName: string, lastName: string, gender: gender}>} user
 */
async function getUserinfo(authToken) {
  const { body } = await request({
    method: 'get',
    url: `${apiHost}/partenaire/peconnect-individu/v1/userinfo`,
    accessToken: authToken.token.access_token,
  })

  return {
    peId: body.sub,
    email: body.email,
    firstName: startCase(toLower(body.given_name)),
    lastName: startCase(toLower(body.family_name)),
    gender: body.gender,
  }
}

/**
 * @param {string} code from req.query.code
 * @param {string} nonce from req.session.nonce
 * @returns {Promise<Object>} authToken
 */
async function getAuthToken(code, nonce) {
  const authToken = await oauth2.authorizationCode
    .getToken({ redirect_uri: redirectUri, code })
    .then((result) => oauth2.accessToken.create(result))
  const tokenClaims = jwt.decode(authToken.token.id_token)
  if (!tokenClaims.iss.startsWith(tokenHost)) throw new Error('Wrong iss')
  if (tokenClaims.aud !== clientId) throw new Error('Wrong aud')
  if (tokenClaims.azp && tokenClaims.azp !== clientId) {
    throw new Error('Wrong azp')
  }
  if (tokenClaims.realm !== REALM) throw new Error('Wrong realm')
  if (tokenClaims.nonce !== nonce) throw new Error('Wrong nonce')
  // https://www.emploi-store-dev.fr/portail-developpeur-cms/home/catalogue-des-api/documentation-des-api/utiliser-les-api/authorization-code-flow/securite-et-verification.html
  // TODO check access_token against at_hash here - possible code:
  // base64url(crypto.createHash('sha256').update(authToken.token.access_token).digest('hex'))

  return authToken
}

/**
 * @returns {Promise<{canSendDeclaration: boolean, hasAlreadySentDeclaration: boolean}>}
 */
async function getActualisationStatus(authToken) {
  return request({
    method: 'get',
    url: `${apiHost}/partenaire/peconnect-actualisation/v1/actualisation`,
    accessToken: authToken.token.access_token,
  })
    .then(({ body: declarationData }) => {
      // We only allow declarations when we have this status code
      // (yes, it doesn't seem to make sense, but that's what the API
      // gives us when the declaration hasn't been done yet)
      const canSendDeclaration =
        declarationData.statut ===
        DECLARATION_STATUSES.IMPOSSIBLE_OR_UNNECESSARY
      const hasAlreadySentDeclaration =
        declarationData.statut === DECLARATION_STATUSES.SAVED

      return { canSendDeclaration, hasAlreadySentDeclaration }
    })
    .catch((err) => {
      // log the error but do not prevent login, however forbid the user from making declarations
      winston.warn('Error while requesting pe actualisation api', err.message)
      Raven.captureException(err)
      return {
        canSendDeclaration: false,
        hasAlreadySentDeclaration: false,
      }
    })
}

/**
 * @returns {Promise<string|null>} postalCode
 */
async function getPostalCode(authToken) {
  return request({
    method: 'get',
    url: `${apiHost}/partenaire/peconnect-coordonnees/v1/coordonnees`,
    accessToken: authToken.token.access_token,
  })
    .then(({ body: coordinates }) => coordinates.codePostal)
    .catch((err) => {
      winston.warn('Error while requesting pe coordinates api', err.message)
      Raven.captureException(err)
      return null
    })
}

/**
 * @desc test if the postalCode is authorized to use ZEN
 * @param {string} postalCode
 * @returns {boolean}
 */
function $isPostalCodeAuthorized(postalCode) {
  return (
    postalCode &&
    DEPARTMENTS_AUTORIZED.some((dep) => postalCode.startsWith(dep))
  )
}

/**
 * @desc test if user is authorized
 * @param {string} postalCode
 * @param {string} situationRegardEmploiId
 * @returns {boolean}
 */
function isAuthorized(postalCode, situationRegardEmploiId) {
  return (
    $isPostalCodeAuthorized(postalCode) && situationRegardEmploiId === 'SAN'
  )
}

/**
 * @desc get user that as not start declaration of the month
 * @param {string} declarationMonthId
 * @returns {Promise<User[]>}
 */
async function getUsersWithoutDeclaration(declarationMonthId) {
  const declarations = await Declaration.query()
    .where('monthId', '=', declarationMonthId)
    .column('userId');
  return User.query()
    .whereNotNull('Users.registeredAt')
    .andWhere('Users.isBlocked', '=', false)
    .andWhere('Users.isAuthorized', '=', true)
    .andWhere('Users.isActuDone', '=', false)
    .whereNotIn('id', declarations.map(d => d.userId))
}

/**
 * @returns {Promise<User[]>}
 */
async function getActiveUsers() {
  return User.query()
    .whereNotNull('Users.registeredAt')
    .andWhere('Users.isBlocked', '=', false)
    .andWhere('Users.isAuthorized', '=', true);
}

module.exports = {
  getUserinfo,
  getAuthToken,
  getActualisationStatus,
  getPostalCode,
  isAuthorized,
  getUsersWithoutDeclaration,
  getActiveUsers,
}
