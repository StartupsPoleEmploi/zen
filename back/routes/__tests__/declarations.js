const express = require('express')
const declarationsRouter = require('../declarations')
const supertest = require('supertest')
const Declaration = require('../../models/Declaration')
const DeclarationMonth = require('../../models/DeclarationMonth')
const Document = require('../../models/Document')
const User = require('../../models/User')

const IMPOSSIBLE_ID = 666666666

let user

const getActiveMonth = () =>
  DeclarationMonth.query()
    .orderBy('id', 'desc')
    .first()
const getInactiveMonth = () =>
  DeclarationMonth.query()
    .orderBy('id', 'asc')
    .first()

const app = express()
app.use((req, res, next) => {
  req.session = {
    user,
  }

  req.user = user
  req.user.tokenExpirationDate = new Date('2100-01-01T00:00:00.000Z')

  getActiveMonth().then((month) => {
    req.activeMonth = month
    next()
  })
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(declarationsRouter)

const declarationFormData = {
  hasWorked: true,
  hasTrained: false,
  hasInternship: false,
  hasSickLeave: false,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
}

const addBasicDeclaration = (params = {}) =>
  Declaration.query()
    .insert({
      ...declarationFormData,
      userId: user.id,
      ...params,
    })
    .returning('*')

const addActiveDeclaration = (params = {}) =>
  getActiveMonth().then((activeMonth) =>
    addBasicDeclaration({ ...params, monthId: activeMonth.id }),
  )

const addInactiveDeclaration = (params = {}) =>
  getInactiveMonth().then((inactiveMonth) =>
    addBasicDeclaration({ ...params, monthId: inactiveMonth.id }),
  )

const addDeclarationWithEmployers = ({ withFile = false }) =>
  Document.query()
    .insert({
      file: 'file.pdf',
      isTransmitted: false,
    })
    .returning('*')
    .then((document) =>
      getActiveMonth().then((activeMonth) =>
        Declaration.query().insertGraph({
          ...declarationFormData,
          userId: user.id,
          employers: [
            {
              userId: user.id,
              employerName: 'Paul',
              workHours: 20,
              salary: 200,
              documentId: withFile ? document.id : undefined,
            },
          ],
          monthId: activeMonth.id,
        }),
      ),
    )

const postSickLeaveDocument = () =>
  addActiveDeclaration({
    hasSickLeave: true,
    sickLeaveStartDate: new Date(),
    sickLeaveEndDate: new Date(),
  }).then((declaration) =>
    supertest(app)
      .post(`/files`)
      .field('declarationId', declaration.id)
      .field('name', 'sickLeaveDocument')
      .attach('document', 'tests/mockDocument.pdf')
      .expect(200)
      .then((res) => res.body),
  )

describe('declarations routes', () => {
  beforeAll(() =>
    User.query()
      .insert({
        peId: 'abcde1234567',
        firstName: 'Hugo',
        lastName: 'Agbonon',
        email: 'pom@pom.fr',
      })
      .returning('*')
      .then((dbUser) => {
        user = dbUser
      }))

  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE;'))

  afterEach(() =>
    Declaration.knex().raw('TRUNCATE "Declarations", "Employers"'))

  describe('GET /', () => {
    test('HTTP 200 with array of Declarations with no querystring', () =>
      supertest(app)
        .get('/')
        .expect(200)
        .then((res) => expect(res.body).toBeInstanceOf(Array)))

    describe('?last', () => {
      test('HTTP 404 if no declaration found', () =>
        supertest(app)
          .get('/?last')
          .expect(404))

      test('HTTP 200 if a declaration is found', () =>
        addActiveDeclaration().then(() =>
          supertest(app)
            .get('/?last')
            .expect(200),
        ))
    })

    describe('?active', () => {
      test('HTTP 404 if no active declaration found', () =>
        addInactiveDeclaration().then(() =>
          supertest(app)
            .get('/?active')
            .expect(404),
        ))

      test('HTTP 200 if a declaration is found', () =>
        addActiveDeclaration().then(() =>
          supertest(app)
            .get('/?active')
            .expect(200),
        ))
    })
  })

  describe('POST /', () => {
    test('HTTP 200 if valid declaration data is sent', () =>
      supertest(app)
        .post('/')
        .send(declarationFormData)
        .expect(200))

    test('HTTP 400 if invalid declaration data is sent', () =>
      supertest(app)
        .post('/')
        .send({})
        .expect(400))
  })

  describe('GET /files', () => {
    test('HTTP 400 if no declaration id or document name was given', () =>
      Promise.all([
        supertest(app)
          .get('/files')
          .expect(400),
        supertest(app)
          .get('/files?declarationId=1')
          .expect(400),
        supertest(app)
          .get('/files?name=sickLeaveDocument')
          .expect(400),
      ]))

    test('HTTP 404 if no declaration was found', () =>
      supertest(app)
        .get(`/files?name=sickLeaveDocument&declarationId=${IMPOSSIBLE_ID}`)
        .expect(404))

    test('HTTP 404 if no file was found', () =>
      addActiveDeclaration().then((declaration) =>
        supertest(app)
          .get(`/files?name=sickLeaveDocument&declarationId=${declaration.id}`)
          .expect(404),
      ))

    test('HTTP 200 if the file was found', () =>
      postSickLeaveDocument().then((declaration) =>
        supertest(app)
          .get(`/files?name=sickLeaveDocument&declarationId=${declaration.id}`)
          .expect(200),
      ))
  })

  describe('POST /files', () => {
    test('HTTP 200 if the file was correctly processed', () =>
      postSickLeaveDocument() // HTTP 200 checked here
        .then((declaration) =>
          expect(declaration.sickLeaveDocument.file).toMatch(/\.pdf$/),
        ))
  })

  describe('POST /finish', () => {
    test('HTTP 404 if no declaration was found', () =>
      supertest(app)
        .post('/finish')
        .send({ id: IMPOSSIBLE_ID })
        .expect(404))

    test('HTTP 400 if the declaration is already finished', () =>
      addActiveDeclaration({ isFinished: true }).then((declaration) =>
        supertest(app)
          .post('/finish')
          .send({ id: declaration.id })
          .expect(400),
      ))

    test('HTTP 400 if the declaration is incomplete', () =>
      addActiveDeclaration({ hasFinishedDeclaringEmployers: false }).then(
        (declaration) =>
          supertest(app)
            .post('/finish')
            .send({ id: declaration.id })
            .expect(400),
      ))

    // Add when we'll simulate sendDocuments
    test.skip('HTTP 200 if declaration is finished', () =>
      addDeclarationWithEmployers({ withFile: true }).then(() =>
        supertest(app)
          .post('/finish')
          .expect(200),
      ))
  })
})
