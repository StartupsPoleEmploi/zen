/* eslint-disable no-await-in-loop */
const config = require('config')
const nock = require('nock')
const { sendDocument } = require('../documents')

const $query = () => ({ patch: () => {} })

const declarationWithLotsOfDocuments = {
  id: 649,
  userId: 88,
  hasWorked: true,
  hasTrained: false,
  hasInternship: true,
  hasSickLeave: true,
  hasMaternityLeave: false,
  hasRetirement: true,
  hasInvalidity: false,
  isLookingForJob: false,
  jobSearchStopMotive: 'other',
  hasFinishedDeclaringEmployers: true,
  isFinished: false,
  createdAt: '2019-01-28T08:06:29.438Z',
  updatedAt: '2019-02-21T12:27:30.515Z',
  monthId: 9,
  isTransmitted: true,
  isEmailSent: true,
  isDocEmailSent: true,
  metadata: {},
  infos: [
    {
      type: 'sickLeave',
      startDate: '2018-12-31T23:00:00.000Z',
      endDate: '2019-01-01T23:00:00.000Z',
      file: '../tests/mockDocument.pdf',
      isTransmitted: false,
      $query,
    },
    {
      type: 'sickLeave',
      startDate: '2019-01-29T23:00:00.000Z',
      endDate: '2019-01-30T23:00:00.000Z',
      file: '../tests/mockDocument.pdf',
      isTransmitted: false,
      $query,
    },
    {
      type: 'retirement',
      startDate: '2019-01-14T23:00:00.000Z',
      file: '../tests/mockDocument.pdf',
      isTransmitted: false,
      $query,
    },
    {
      type: 'jobSearch',
      endDate: '2019-01-22T23:00:00.000Z',
      $query,
    },

    {
      type: 'internship',
      startDate: '2019-01-08T23:00:00.000Z',
      endDate: '2019-01-09T23:00:00.000Z',
      file: '../tests/mockDocument.pdf',
      isTransmitted: false,
      $query,
    },
    {
      type: 'internship',
      startDate: '2019-01-14T23:00:00.000Z',
      endDate: '2019-01-15T23:00:00.000Z',
      file: '../tests/mockDocument.pdf',
      isTransmitted: false,
      $query,
    },
    {
      type: 'internship',
      startDate: '2019-01-28T23:00:00.000Z',
      endDate: '2019-01-29T23:00:00.000Z',
      file: '../tests/mockDocument.pdf',
      isTransmitted: false,
      $query,
    },
  ],
  employers: [
    {
      id: 2070,
      userId: 88,
      declarationId: 649,
      employerName: 'Amuro Ray',
      workHours: 222,
      salary: 894,
      hasEndedThisMonth: false,
      createdAt: '2019-01-28T08:07:38.640Z',
      updatedAt: '2019-02-21T11:20:00.140Z',
      documents: [
        {
          id: 2320,
          file: '../tests/mockDocument.pdf',
          isTransmitted: false,
          createdAt: '2019-02-18T12:38:46.552Z',
          updatedAt: '2019-02-21T12:27:27.699Z',
          type: 'salarySheet',
          employerId: 2070,
          $query,
        },
      ],
    },
    {
      id: 2069,
      userId: 88,
      declarationId: 649,
      employerName: 'SMS Shoutai',
      workHours: 122,
      salary: 490,
      hasEndedThisMonth: true,
      createdAt: '2019-01-28T08:07:38.640Z',
      updatedAt: '2019-02-21T11:20:00.140Z',
      documents: [
        {
          id: 2319,
          file: '../tests/mockDocument.pdf',
          isTransmitted: false,
          createdAt: '2019-02-18T12:38:44.215Z',
          updatedAt: '2019-02-21T12:27:30.495Z',
          type: 'employerCertificate',
          employerId: 2069,
          $query,
        },
      ],
    },
  ],
  declarationMonth: {
    id: 9,
    month: '2018-12-31T23:00:00.000Z',
    startDate: '2019-01-27T23:00:00.000Z',
    endDate: '2019-02-21T23:00:00.000Z',
    createdAt: '2019-01-10T14:08:40.453Z',
    updatedAt: '2019-02-21T11:20:00.164Z',
  },
}

const accessToken = 'AZERTYUIOP'

describe('PE API: sendDocument', () => {
  const conversionId = 1
  let uploadScope
  let confirmationScope
  let parsedUploadHeaders = null
  let parsedConfirmationBody = null
  let parsedConfirmationHeaders = null

  const resetVariablesUsedForChecks = () => {
    parsedUploadHeaders = null
    parsedConfirmationBody = null
    parsedConfirmationHeaders = null
  }

  beforeEach(resetVariablesUsedForChecks)

  describe('API call success', () => {
    beforeAll(() => {
      uploadScope = nock(config.apiHost)
        .post(`/partenaire/peconnect-envoidocument/v1/depose?synchrone=true`)
        .reply(function() {
          parsedUploadHeaders = this.req.headers
          return [200, { conversionId }]
        })
        .persist()

      confirmationScope = nock(config.apiHost)
        .post(
          `/partenaire/peconnect-envoidocument/v1/depose/${conversionId}/confirmer`,
          (body) => {
            parsedConfirmationBody = body
            return body
          },
        )
        .reply(function() {
          parsedConfirmationHeaders = this.req.headers
          return [200]
        })
        .persist()
    })

    afterAll(() => {
      uploadScope.persist(false)
      confirmationScope.persist(false)
    })

    const performChecks = () => {
      expect(parsedConfirmationBody).toMatchSnapshot()
      ;[parsedUploadHeaders, parsedConfirmationHeaders].forEach((headers) => {
        expect(headers.authorization).toContain(accessToken)
        expect(headers.accept).toBe('application/json')
        expect(headers.media).toBe('M')
        expect(headers['accept-encoding']).toBe('gzip')
      })
      expect(parsedUploadHeaders['content-type']).toContain(
        'multipart/form-data;',
      )
    }

    it('should send formatted data for documents', async () => {
      for (const declarationInfo of declarationWithLotsOfDocuments.infos) {
        if (declarationInfo.type === 'jobSearch') continue
        declarationInfo.declaration = declarationWithLotsOfDocuments // shortcut for these tests.
        await sendDocument({
          document: declarationInfo,
          accessToken,
        })
        performChecks()
        resetVariablesUsedForChecks()
      }

      for (const employer of declarationWithLotsOfDocuments.employers) {
        for (const employerDoc of employer.documents) {
          employerDoc.employer = employer // shortcut for these tests.
          employerDoc.employer.declaration = declarationWithLotsOfDocuments // shortcut for these tests.
          await sendDocument({
            document: employerDoc,
            accessToken,
          })
          performChecks()
          resetVariablesUsedForChecks()
        }
      }
    })
  })
})
