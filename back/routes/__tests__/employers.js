const express = require('express');
const supertest = require('supertest');
const employersRouter = require('../employers');
const Declaration = require('../../models/Declaration');
const DeclarationMonth = require('../../models/DeclarationMonth');
const User = require('../../models/User');

let user;

const IMPOSSIBLE_ID = 666666666;

const getActiveMonth = () => DeclarationMonth.query().first();

const app = express();
app.use((req, res, next) => {
  req.session = {
    user,
  };

  getActiveMonth().then((month) => {
    req.activeMonth = month;
    next();
  });
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(employersRouter);

const validDeclaration = {
  hasWorked: true,
  hasTrained: false,
  hasInternship: false,
  hasSickLeave: false,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
  userId: 1,
};

const employer1 = {
  employerName: 'Paul',
  workHours: 20,
  salary: 200,
};

const employer2 = { ...employer1, employerName: 'Jacques' };

const addBasicDeclaration = () =>
  getActiveMonth().then((activeMonth) =>
    Declaration.query()
      .insert({
        ...validDeclaration,
        userId: user.id,
        monthId: activeMonth.id,
      })
      .returning('*'));

const addDeclarationWithEmployers = () =>
  getActiveMonth().then((activeMonth) =>
    Declaration.query()
      .upsertGraph({
        ...validDeclaration,
        userId: user.id,
        employers: [
          {
            ...employer1,
            userId: user.id,
          },
        ],
        monthId: activeMonth.id,
      })
      .returning('*'));

// Adds a document, returned for further use, and tests that the upload worked correctly
const postEmployerDocument = (declaration, type = 'salarySheet') =>
  supertest(app)
    .post('/files')
    .field('employerId', declaration.employers[0].id)
    .field('documentType', type)
    .attach('document', 'tests/mockDocument.pdf')
    .expect(200)
    .then((res) => res.body);

describe('employers routes', () => {
  beforeAll(() =>
    User.query()
      .insert({
        peId: 'abcde123456',
        firstName: 'Hugo',
        lastName: 'Agbonon',
        email: 'pom@pom.fr',
      })
      .returning('*')
      .then((dbUser) => {
        user = dbUser;
      }));

  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE;'));
  afterEach(() =>
    Declaration.knex().raw(
      'TRUNCATE "declarations", "employers", "declaration_infos", "employer_documents" CASCADE',
    ));

  describe('POST /', () => {
    test('HTTP 400 if no data sent', () =>
      supertest(app)
        .post('/')
        .expect(400));

    test('HTTP 400 if no declaration is found', () =>
      supertest(app)
        .post('/')
        .send({ employers: [employer1] })
        .expect(400));

    test('HTTP 200 if employers were correctly added', () =>
      addBasicDeclaration().then(() =>
        supertest(app)
          .post('/')
          .send({ employers: [employer1] })
          .expect(200)
          .then(({ body }) =>
            expect(body.employers).toMatchObject([employer1]))));

    test('HTTP 200 if employers were correctly updated', () =>
      addDeclarationWithEmployers().then(() =>
        supertest(app)
          .post('/')
          .send({ employers: [employer2] })
          .expect(200)
          .then(({ body }) =>
            expect(body.employers).toMatchObject([employer2]))));
  });

  describe('GET /files', () => {
    test('HTTP 400 if no employerId is sent', () =>
      supertest(app)
        .get('/files')
        .expect(400));

    test('HTTP 404 if no file is found', () =>
      supertest(app)
        .get(`/files?documentId=${IMPOSSIBLE_ID}`)
        .expect(404));

    test('HTTP 200 if a file is found', () =>
      addDeclarationWithEmployers()
        .then(postEmployerDocument)
        .then((employer) =>
          supertest(app)
            .get(`/files?documentId=${employer.documents[0].id}`)
            .expect(200)));
  });

  describe('POST /files', () => {
    test('HTTP 400 if no file is sent', () =>
      supertest(app)
        .post('/files')
        .field('employerId', 666));

    test('HTTP 400 if no employerId is sent', () =>
      supertest(app)
        .post('/files')
        .field('documentType', 'employerCertificate')
        .attach('document', 'tests/mockDocument.pdf'));

    test('HTTP 400 if no documentType is sent', () =>
      supertest(app)
        .post('/files')
        .field('employerId', 1)
        .attach('document', 'tests/mockDocument.pdf'));

    test('HTTP 400 if a bad documentType is sent', () =>
      supertest(app)
        .post('/files')
        .field('employerId', 1)
        .field('documentType', 'something')
        .attach('document', 'tests/mockDocument.pdf'));

    test('HTTP 404 if no employer is found', () =>
      supertest(app)
        .post('/files')
        .field('employerId', 666)
        .field('documentType', 'employerCertificate')
        .attach('document', 'tests/mockDocument.pdf')
        .expect(404));

    test('HTTP 200 if the file is correctly processed', () =>
      // HTTP 200 is checked in postEmployerDocument
      // This also checks the correct behaviour of the routes' files replacements mechanisms
      addDeclarationWithEmployers().then(async (declaration) => {
        const employer = await postEmployerDocument(declaration);
        // File was correctly uploaded
        expect(employer.documents.length).toEqual(1);

        // Check that sending the same file correctly replaces it (same id returned)
        const employerAfterSecondUpload = await postEmployerDocument(
          declaration,
        );
        expect(employerAfterSecondUpload.documents[0].id).toEqual(
          employer.documents[0].id,
        );
        expect(employer.documents.length).toEqual(1);

        // Upload document of another type and check that it was correctly added
        const employerAfterThirdUpload = await postEmployerDocument(
          declaration,
          'employerCertificate',
        );
        expect(employerAfterThirdUpload.documents.length).toEqual(2);

        // Check that sending the same file correctly replaces it (same id returned)
        const employerAfterFourthUpload = await postEmployerDocument(
          declaration,
          'employerCertificate',
        );
        expect(employerAfterFourthUpload.documents.length).toEqual(2);

        expect(employerAfterFourthUpload.documents[0].id).toEqual(
          employerAfterThirdUpload.documents[0].id,
        );
      }));
  });
});
