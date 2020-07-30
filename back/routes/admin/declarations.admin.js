const express = require('express');
const { format } = require('date-fns');
const zip = require('express-easy-zip');
const path = require('path');
const { get, isUndefined, kebabCase } = require('lodash');
const { uploadsDirectory: uploadDestination } = require('config');
const { Parser } = require('json2csv');

const { DATA_EXPORT_FIELDS } = require('../../lib/exportUserList');
const Declaration = require('../../models/Declaration');
const DeclarationMonth = require('../../models/DeclarationMonth');
const DeclarationReview = require('../../models/DeclarationReview');

const router = express.Router();
router.use(zip());

router.get('/declarationsMonths', (req, res, next) => {
  DeclarationMonth.query()
    .where('startDate', '<=', new Date())
    .orderBy('startDate', 'desc')
    .then((declarationMonths) => res.json(declarationMonths))
    .catch(next);
});

router.get('/declarations', (req, res, next) => {
  if (!req.query.monthId) {
    return res.status(501).json('Must add monthId as query param');
  }

  let conditions = { monthId: req.query.monthId };
  if ('onlyDone' in req.query && req.query.onlyDone === 'true') {
    conditions = { ...conditions, hasFinishedDeclaringEmployers: true };
  }

  Declaration.query()
    .eager('user')
    .where(conditions)
    .then((declarations) => res.json(declarations))
    .catch(next);
});

router.get('/declaration/users/csv', async (req, res, next) => {
  const { condition, monthId } = req.query;
  if (!monthId || Number.isNaN(+monthId)) return res.send(400);

  // Filename
  let filename = 'actualisations-debutees';
  if (condition === 'hasFinishedDeclaringEmployers') {
    filename = 'actualisations-terminees';
  } else if (condition === 'isFinished') filename = 'documents-envoyes';

  // Query
  const query = Declaration.query()
    .eager('user')
    .where({ monthId });

  if (condition === 'hasFinishedDeclaringEmployers') {
    query.andWhere({ hasFinishedDeclaringEmployers: true });
  } else if (condition === 'isFinished') {
    query.andWhere({ isFinished: true });
  }

  const declarations = await query.execute();
  const users = declarations.map((d) => d.user);

  // Generate CSV
  try {
    const json2csvParser = new Parser({ DATA_EXPORT_FIELDS });
    const csv = json2csvParser.parse(users);
    res.set(
      'Content-disposition',
      `attachment; filename=${filename}-${format(
        new Date(),
        'YYYY-MM-DD',
      )}.csv`,
    );
    res.set('Content-type', 'text/csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/declarations/:id', (req, res, next) => {
  Declaration.query()
    .eager('[user, employers.documents, review, infos, declarationMonth]')
    .findById(req.params.id)
    .then((declaration) => {
      if (!declaration) return res.send(404, 'Declaration not found');
      return res.json(declaration);
    })
    .catch(next);
});

router.get('/declarations/:declarationId/files', (req, res) => {
  Declaration.query()
    .eager('[infos, employers.documents, user, declarationMonth]')
    .findById(req.params.declarationId)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration');

      const formattedMonth = format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      );

      const files = declaration.infos
        .map((info) => ({
          label: info.type,
          value: info.file,
        }))
        .concat(
          declaration.employers.map((employer) => ({
            label: `employer-${employer.employerName}`,
            value: get(employer, 'documents[0].file'),
          })),
        )
        .filter(({ value }) => value) // remove null values
        .map((file, key) => ({
          path: `${uploadDestination}${file.value}`,
          name: kebabCase(
            `${declaration.user.firstName}-${declaration.user.lastName}-${
              file.label
            }-${formattedMonth}-${String.fromCharCode(key + 97)}`, // identifier to avoid duplicates
          ).concat(
            // PE.fr uploads do not handle "jpeg" files (-_-), so renaming on the fly.
            path.extname(file.value) === '.jpeg'
              ? '.jpg'
              : path.extname(file.value),
          ),
        }));

      if (files.length === 0) return res.send('Pas de fichiers disponibles');

      res.zip({
        files,
        filename: `${declaration.user.firstName}-${
          declaration.user.lastName
        }-${formattedMonth}-fichiers-${
          declaration.isFinished ? 'validés' : 'non-validés'
        }.zip`,
      });
    });
});

router.post('/declarations/review', (req, res, next) => {
  if (
    !req.body.declarationId
    || (!req.body.notes && isUndefined(req.body.isVerified))
  ) {
    return res.status(400).json('Incomplete request');
  }

  const declarationId = +req.body.declarationId;

  Declaration.query()
    .eager('review')
    .findById(declarationId)
    .then((declaration) => {
      const declarationNoteObj = {};

      if ('isVerified' in req.body) {
        declarationNoteObj.isVerified = req.body.isVerified;
      }
      if ('notes' in req.body) {
        declarationNoteObj.notes = req.body.notes;
      }

      if (declaration.review) {
        return declaration.review
          .$query()
          .patch(declarationNoteObj)
          .then(() => res.json('ok'));
      }

      return DeclarationReview.query()
        .insert({
          declarationId,
          ...declarationNoteObj,
        })
        .then(() => res.json('ok'));
    })
    .catch(next);
});

module.exports = router;
