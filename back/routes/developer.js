/*
  These routes must ever ONLY be included in dev mode.
*/

const express = require('express')
const User = require('../models/User')

const router = express.Router()

router.get('/session/user', (req, res) => {
  if (!req.session.userSecret) {
    // creating userSecret if it does not exist will avoid some errors if this mode is used,
    // as some routes require req.session.userSecret.accessToken, which is not useful
    // if using config bypasses
    req.session.userSecret = {}
  }

  res.json(req.session.user || {})
})

/*
    Security audits will use an URL to access to dev-Zen and can't do any login action.
    But by doing this, the robot will be always redirecting to the homepage...

    To avoid that, we handle an `connectedAs={ID}` parameter that, if added in the URL,
    will automatically connect user (with the given ID) and if there is no session yet.

    Ex: http://localhost/api/developer/fake-auth?connectedAs=6687&to=%2Ffiles
*/
router.get('/fake-auth', async (req, res) => {
  if (req.query.connectedAs && !req.session.user) {
    const connectedAsId = Number(req.query.connectedAs)

    if (!Number.isNaN(connectedAsId)) {
      const currentId = req.session.user ? req.session.user.id : null

      if (currentId !== connectedAsId) {
        const user = await User.query().findById(connectedAsId)
        const { id, firstName, lastName, email, gender } = user

        req.session.user = {
          id,
          firstName,
          lastName,
          email,
          gender,
          isAuthorized: true,
          canSendDeclaration: true,
          hasAlreadySentDeclaration: false,
          tokenExpirationDate: new Date(1654719447626),
        }
      }
    }
  }

  return res.redirect(req.query.to ? decodeURIComponent(req.query.to) : '/')
})

router.post('/session/user', (req, res) => {
  req.session.user = req.body
  res.json('ok')
})

module.exports = router
