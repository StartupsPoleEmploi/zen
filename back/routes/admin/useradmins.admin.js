const express = require('express')

const { deleteUser } = require('../../lib/user')
const Useradmin = require('../../models/Useradmin')

const router = express.Router()

router.get('/useradmins', async (req, res, next) => {
  try {
    const useradmins = await Useradmin.query();
    return res.json(useradmins);
  } catch (err) {
    next(err)
  }
})

router.get('/useradmins/:id', async (req, res, next) => {
  Useradmin.query()
    .findById(req.params.id)
    .then((useradmin) => {
      if (!useradmin) return res.send(404, 'Useradmin not found')
      return res.json(useradmin)
    })
    .catch(next)
})

// get users *not* in db
router.post('/useradmins/add', async (req, res, next) => {
  try {
    const useradmin = await Useradmin.query().findOne({ email: req.body.email });
    if (useradmin) {
      return res.send(400, "Email déjà utilisé");
    }
    const userAdd = await Useradmin.query().insert(req.body);
    return res.json(userAdd)
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.send(400, err.message);
    }
    return next(err)
  }
})

router.post('/useradmins/:id/update', async (req, res, next) => {
  try {
    const useradmin = await Useradmin.query().findById(req.params.id);
    if (!useradmin) return res.status(400).json('Invalid id')

    const userEdit = await useradmin.$query().patch(req.body).returning('*')
    return res.json(userEdit)
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.send(400, err.message);
    }
    return next(err)
  }
})


router.delete('/useradmins/delete', (req, res, next) => {
  const { userId } = req.query
  if (!userId) throw new Error('No user id given')

  Useradmin.query()
    .eager('[employers.documents, declarations.[infos,review]]')
    .findById(userId)
    .then((user) => {
      if (!user) throw new Error('No such user id')
      return deleteUser(user)
    })
    .then(() => res.send('ok'))
    .catch(next)
})

module.exports = router
