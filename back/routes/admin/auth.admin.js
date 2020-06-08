const express = require('express')
const bcryptjs = require('bcryptjs')
const { pick } = require('lodash')

const Useradmin = require('../../models/Useradmin')

const router = express.Router()

function compartPassword(password, passwordEncrypt) {
  return bcryptjs.compareSync(password, passwordEncrypt);
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const useradmin = await Useradmin.query().findOne({ email });
    if (!useradmin || !compartPassword(password, useradmin.password)) {
      return res.send(400, "Email ou mot de passe invalide");
    }

    req.session.useradmin = {
      ...pick(useradmin, ['id', 'firstName', 'lastName', 'email', 'type']),
      loginDate: new Date(),
    }

    return res.json(useradmin)
  } catch (err) {
    return next(err)
  }
})

router.get('/autologin', async (req, res, next) => {
  try {
    if (req.session && req.session.useradmin) {
      return res.json(req.session.useradmin)
    }
    return res.send(401);
  } catch (err) {
    return next(err)
  }
})

router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
  }
  return res.send(201);
})


module.exports = router
