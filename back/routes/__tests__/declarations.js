const express = require('express')
const supertest = require('supertest')
const declarationsRouter = require('../declarations')
const Declaration = require('../../models/Declaration')
const DeclarationMonth = require('../../models/DeclarationMonth')
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
  hasSickLeave: true,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
  infos: [
    {
      type: 'sickLeave',
      startDate: new Date(0),
      endDate: new Date(),
    },
  ],
}

const addBasicDeclaration = (params = {}) =>
  Declaration.query().upsertGraphAndFetch({
    ...declarationFormData,
    userId: user.id,
    ...params,
  })

const addActiveDeclaration = (params = {}) =>
  getActiveMonth().then((activeMonth) =>
    addBasicDeclaration({ ...params, monthId: activeMonth.id }),
  )

const addInactiveDeclaration = (params = {}) =>
  getInactiveMonth().then((inactiveMonth) =>
    addBasicDeclaration({ ...params, monthId: inactiveMonth.id }),
  )

const postSickLeaveDocument = () =>
  addActiveDeclaration({
    hasSickLeave: true,
  }).then((declaration) =>
    supertest(app)
      .post(`/files`)
      .field('declarationInfoId', declaration.infos[0].id)
      .field('name', 'sickLeave')
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
      }),
  )

  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE;'))

  afterEach(() =>
    Declaration.knex().raw(
      'TRUNCATE "declarations", "employers", "declaration_infos", "employer_documents" CASCADE',
    ),
  )

  describe('GET /', () => {
    test('HTTP 200 with array of Declarations with no querystring', () =>
      supertest(app)
        .get('/')
        .expect(200)
        .then((res) => expect(res.body).toBeInstanceOf(Array)))

    describe('?last', () => {
      test('HTTP 404 if no declaration found', () =>
        supertest(app)
          .get('/?last=true')
          .expect(404))

      test('HTTP 200 if a declaration is found', () =>
        addActiveDeclaration().then(() =>
          supertest(app)
            .get('/?last=true')
            .expect(200),
        ))
    })

    describe('?active', () => {
      test('HTTP 404 if no active declaration found', () =>
        addInactiveDeclaration().then(() =>
          supertest(app)
            .get('/?active=true')
            .expect(404),
        ))

      test('HTTP 200 if a declaration is found', () =>
        addActiveDeclaration().then(() =>
          supertest(app)
            .get('/?active=true')
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
    test('HTTP 400 if no document id was given', () =>
      Promise.all([
        supertest(app)
          .get('/files')
          .expect(400),
      ]))

    test('HTTP 404 if no file was found', () =>
      supertest(app)
        .get(`/files?declarationInfoId=${IMPOSSIBLE_ID}`)
        .expect(404))

    test('HTTP 200 if the file was found', () =>
      postSickLeaveDocument().then((declaration) =>
        supertest(app)
          .get(
            `/files?declarationInfoId=${
              declaration.infos.find((doc) => doc.type === 'sickLeave').id
            }`,
          )
          .expect(200),
      ))
  })

  describe('POST /files', () => {
    test('HTTP 200 if the file was correctly processed', () =>
      postSickLeaveDocument() // HTTP 200 checked here
        .then((declaration) =>
          expect(
            declaration.infos.find((doc) => doc.type === 'sickLeave').file,
          ).toMatch(/\.pdf$/),
        ))
  })
})
