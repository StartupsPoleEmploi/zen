const express = require('express')
const declarationsRouter = require('../declarations')
const supertest = require('supertest')
const Declaration = require('../../models/Declaration')
const Employer = require('../../models/Employer')
const User = require('../../models/User')

const user = {
  id: 1,
  peId: 'abcde123456',
  firstName: 'Hugo',
  lastName: 'Agbonon',
  email: 'pom@pom.fr',
}

const app = express()
app.use((req, res, next) => {
  req.session = {
    user,
  }

  next()
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

const validDeclaration = {
  userId: 1,
  declaredMonth: '2018-05-01',
  ...declarationFormData,
}

const addBasicDeclaration = () => Declaration.query().insert(validDeclaration)

const addDeclarationWithEmployers = ({ withFile = false }) =>
  Declaration.query().upsertGraph({
    ...validDeclaration,
    employers: [
      {
        userId: 1,
        employerName: 'Paul',
        workHours: 20,
        salary: 200,
        file: withFile ? 'file.pdf' : null,
      },
    ],
  })

describe('declarations routes', () => {
  beforeAll(() => User.query().insert(user))
  afterEach(() =>
    Promise.all([
      Declaration.knex().raw('TRUNCATE "Declarations" CASCADE'),
      Employer.knex().raw('TRUNCATE "Employers" CASCADE'),
    ]))
  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE'))

  describe('GET /', () => {
    test('HTTP 400 if no querystring specified', () =>
      supertest(app)
        .get('/')
        .expect(400))

    describe('?last', () => {
      test('HTTP 404 if no declaration found', () =>
        supertest(app)
          .get('/?last')
          .expect(404))

      test('HTTP 200 if a declaration is found', () =>
        addBasicDeclaration().then(() =>
          supertest(app)
            .get('/?last')
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

  describe('POST /finish', () => {
    test('HTTP 404 if no declaration was found', () =>
      supertest(app)
        .get('/finish')
        .send(declarationFormData)
        .expect(404))

    test('HTTP 400 if no employers were found in the declaration', () =>
      addBasicDeclaration().then(() =>
        supertest(app)
          .post('/finish')
          .expect(400),
      ))

    test('HTTP 400 if employers files were not found', () =>
      addDeclarationWithEmployers({ withFile: false }).then(() =>
        supertest(app)
          .post('/finish')
          .expect(400),
      ))

    // TODO add when implemented
    test.skip('HTTP 400 if declaration files were not found', () =>
      supertest(app)
        .post('/finish')
        .expect(400))

    test('HTTP 200 if declaration is finished', () =>
      addDeclarationWithEmployers({ withFile: true }).then(() =>
        supertest(app)
          .post('/finish')
          .expect(200),
      ))
  })
})
