const express = require('express');
const fs = require('fs');

const router = express.Router();
const Declaration = require('../models/Declaration');

router.get('/:fileName', (req, res, next) => {
  if (!req.session.user) return res.status(400).json('No user');

  return Declaration.query()
    .joinRelation('[employers.[documents], infos]')
    .where((builder) => {
      builder.where('employers:documents.file', '=', req.params.fileName)
        .orWhere('infos.file', '=', req.params.fileName);
    })
    .andWhere('declarations.userId', req.session.user.id)
    .then((declarations) => {
      if (!declarations || declarations.length === 0) {
        res.status(400).json('Document not found');
      } else {
        const file = fs.readFileSync(`${__dirname}/../uploads/${req.params.fileName}`, 'binary');

        res.setHeader('Content-Length', file.length);
        res.write(file, 'binary');
        res.end();
      }
    })
    .catch(next);
});

module.exports = router;
