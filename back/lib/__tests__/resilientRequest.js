const nock = require('nock')
const { omit } = require('lodash')
const fs = require('fs')

const { request } = require('../resilientRequest')

const accessToken = '1234567890'

const HOST = 'http://localhost'
const PATH = '/foo'
const PATH2 = '/bar'
const URL = `${HOST}${PATH}`
const URL2 = `${HOST}${PATH2}`

describe('lib: resilientRequest', () => {
  it('should handle OK requests', async (done) => {
    nock(HOST)
      .get(PATH)
      .reply(function() {
        expect(this.req.headers).toMatchSnapshot()
        return [200]
      })

    nock(HOST)
      .post(PATH, (body) => {
        const readableBody = Buffer.from(body, 'hex').toString('ascii')
        expect(
          readableBody.includes(
            'Content-Disposition: form-data; name="lancerConversion"',
          ),
        ).toBe(true)
        expect(
          readableBody.includes(
            'Content-Disposition: form-data; name="fichier"; filename="1.pdf"',
          ),
        ).toBe(true)
        return body
      })
      .reply(function() {
        // content-type contains a boundary which changes at each generation
        expect(omit(this.req.headers, 'content-type')).toMatchSnapshot()
        return [200]
      })

    nock(HOST)
      .post(PATH2, (body) => {
        expect(body).toMatchSnapshot()
        return body
      })
      .reply(function() {
        expect(omit(this.req.headers, 'content-type')).toMatchSnapshot()
        return [200]
      })

    await request({
      method: 'get',
      url: URL,
      accessToken,
    })

    await request({
      url: URL,
      method: 'post',
      headers: [{ key: 'media', value: 'M' }],
      fields: [{ key: 'lancerConversion', value: true }],
      attachments: [
        {
          name: 'fichier',
          file: fs.createReadStream('./tests/mockDocument.pdf'),
          uploadname: '1.pdf',
        },
      ],
      accessToken,
    })

    await request({
      url: URL2,
      method: 'post',
      data: { foo: 'bar' },
      accessToken,
    })

    done()
  })

  it('should retry if a request fails with a HTTP 429', (done) => {
    nock(HOST)
      .get(PATH)
      .reply(429)

    nock(HOST)
      .get(PATH)
      .reply(200)

    request({
      method: 'get',
      url: URL,
      accessToken,
    }).then(() => done())
  })

  it('should fail if we get too many HTTP 429', (done) => {
    const scope = nock(HOST)
      .get(PATH)
      .reply(429)
      .persist()

    request({
      method: 'get',
      url: URL,
      accessToken,
    }).catch((err) => {
      expect(err.status).toEqual(429)
      scope.persist(false)
      done()
    })
  })

  it('should fail if it gets a non 429 HTTP error', (done) => {
    const scope = nock(HOST)
      .get(PATH)
      .reply(500)
      .persist()

    request({
      method: 'get',
      url: URL,
      accessToken,
    }).catch((err) => {
      expect(err.status).toEqual(500)
      scope.persist(false)
      done()
    })
  })
})
