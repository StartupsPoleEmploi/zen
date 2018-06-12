const express = require('express')
const employersRouter = require('../employers')
const supertest = require('supertest')
const Declaration = require('../../models/Declaration')
const User = require('../../models/User')

let user

const app = express()
app.use((req, res, next) => {
  req.session = {
    user,
  }

  next()
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
  declaredMonth: '2018-05-01',
}

const employer1 = {
  employerName: 'Paul',
  workHours: 20,
  salary: 200,
}

const employer2 = { ...employer1, employerName: 'Jacques' }

const addBasicDeclaration = () =>
  Declaration.query().insert({ ...validDeclaration, userId: user.id })

const addDeclarationWithEmployers = () =>
  Declaration.query().upsertGraph({
    ...validDeclaration,
    userId: user.id,
    employers: [
      {
        ...employer1,
        userId: user.id,
      },
    ],
  })

describe.only('employers routes', () => {
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
    Declaration.knex().raw('TRUNCATE "Declarations", "Employers"'))

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
          .then(({ body }) => expect(body).toMatchObject([employer1])),
      ))

    test('HTTP 200 if employers were correctly updated', () =>
      addDeclarationWithEmployers().then(() =>
        supertest(app)
          .post('/')
          .send({ employers: [employer2] })
          .expect(200)
          .then(({ body }) => expect(body).toMatchObject([employer2])),
      ))
  })
})
