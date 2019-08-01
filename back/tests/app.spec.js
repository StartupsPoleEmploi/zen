const supertest = require('supertest')
const app = require('../app') // eslint-disable-line

describe('app.js', () => {
  test('Should not let main routes be accessed without user session', () =>
    Promise.all([
      supertest(app)
        .get('/user')
        .expect(401),
      supertest(app)
        .get('/declarations')
        .expect(401),
      supertest(app)
        .get('/employers')
        .expect(401),
    ]))

  test('GET /ping route should answer', () =>
    supertest(app)
      .get('/ping')
      .expect(200))
})
