const express = require('express')
const employersRouter = require('../employers')
const supertest = require('supertest')
const Declaration = require('../../models/Declaration')
const DeclarationMonth = require('../../models/DeclarationMonth')
const User = require('../../models/User')

let user

const getActiveMonth = () => DeclarationMonth.query().first()

const app = express()
app.use((req, res, next) => {
  req.session = {
    user,
  }

  getActiveMonth().then((month) => {
    req.activeMonth = month
    next()
  })
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(employersRouter)

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
}

const employer1 = {
  employerName: 'Paul',
  workHours: 20,
  salary: 200,
}

const employer2 = { ...employer1, employerName: 'Jacques' }

const addBasicDeclaration = () =>
  getActiveMonth().then((activeMonth) =>
    Declaration.query()
      .insert({
        ...validDeclaration,
        userId: user.id,
        monthId: activeMonth.id,
      })
      .returning('*'),
  )

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
      .returning('*'),
  )

const postEmployerDocument = () =>
  addDeclarationWithEmployers().then((declaration) =>
    supertest(app)
      .post(`/files`)
      .field('employerId', declaration.employers[0].id)
      .attach('document', 'tests/mockDocument.pdf')
      .expect(200)
      .then((res) => res.body),
  )

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
        user = dbUser
      }))

  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE;'))
  afterEach(() =>
    Declaration.knex().raw('TRUNCATE "Declarations", "Employers", "documents"'))

  describe('GET /', () => {
    test('HTTP throws if no declaration is found', () =>
      supertest(app).get('/'))

    test('HTTP 200 if a declaration is found', () =>
      addBasicDeclaration().then(() =>
        supertest(app)
          .get('/')
          .expect(200),
      ))
  })

  describe('POST /', () => {
    test('HTTP 400 if no data sent', () =>
      supertest(app)
        .post('/')
        .expect(400))

    test('HTTP 400 if no declaration is found', () =>
      supertest(app)
        .post('/')
        .send({ employers: [employer1] })
        .expect(400))

    test('HTTP 200 if employers were correctly added', () =>
      addBasicDeclaration().then(() =>
        supertest(app)
          .post('/')
          .send({ employers: [employer1] })
          .expect(200)
          .then(({ body }) =>
            expect(body.employers).toMatchObject([employer1]),
          ),
      ))

    test('HTTP 200 if employers were correctly updated', () =>
      addDeclarationWithEmployers().then(() =>
        supertest(app)
          .post('/')
          .send({ employers: [employer2] })
          .expect(200)
          .then(({ body }) =>
            expect(body.employers).toMatchObject([employer2]),
          ),
      ))
  })

  describe('GET /files', () => {
    test('HTTP 400 if no employerId is sent', () =>
      supertest(app)
        .get('/files')
        .expect(400))

    test('HTTP 404 if no employer is found', () =>
      supertest(app)
        .get('/files?employerId=666')
        .expect(404))

    test('HTTP 404 if no file is found', () =>
      addDeclarationWithEmployers().then(() =>
        supertest(app)
          .get('/files?employerId=666')
          .expect(404),
      ))

    test('HTTP 200 if a file is found', () =>
      postEmployerDocument().then((employer) =>
        supertest(app)
          .get(`/files?employerId=${employer.id}`)
          .expect(200),
      ))
  })

  describe('POST /files', () => {
    test('HTTP 400 if no file is sent', () =>
      supertest(app)
        .post(`/files`)
        .field('employerId', 666))

    test('HTTP 400 if no employerId is sent', () =>
      supertest(app)
        .post(`/files`)
        .attach('document', 'tests/mockDocument.pdf'))

    test('HTTP 404 if no employer is found', () =>
      supertest(app)
        .post(`/files`)
        .field('employerId', 666)
        .attach('document', 'tests/mockDocument.pdf')
        .expect(404))

    test('HTTP 200 if the file is processed', () =>
      // HTTP 200 is checked in postEmployerDocument
      postEmployerDocument().then((employer) =>
        expect(employer.documentId).toBeDefined(),
      ))
  })
})
