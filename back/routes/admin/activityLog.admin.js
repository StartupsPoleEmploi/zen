const express = require('express');
const zip = require('express-easy-zip');

const ActivityLog = require('../../models/ActivityLog');

const router = express.Router();
router.use(zip());

// No login form for now, users must be inserted in db manually.
router.get('/activityLog', (req, res) => {
  ActivityLog.query()
    .withGraphFetched('user')
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .then((logs) => res.json(logs));
});

module.exports = router;
