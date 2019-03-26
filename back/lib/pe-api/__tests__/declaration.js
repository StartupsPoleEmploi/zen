/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const config = require('config')
const nock = require('nock')
const { sendDeclaration } = require('../declaration')
const { DECLARATION_STATUSES } = require('../../../constants')

const declarationWithEmployers = {
  id: 543,
  userId: 165,
  hasWorked: true,
  hasTrained: false,
  hasInternship: false,
  hasSickLeave: false,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
  jobSearchStopMotive: null,
  hasFinishedDeclaringEmployers: true,
  isFinished: false,
  createdAt: '2019-01-02T15:55:29.957Z',
  updatedAt: '2019-01-07T11:48:53.839Z',
  monthId: 8,
  isTransmitted: false,
  isEmailSent: false,
  isDocEmailSent: false,
  employers: [
    {
      employerName: 'Test',
      workHours: 23,
      salary: 34,
      hasEndedThisMonth: false,
      id: 1735,
      userId: 165,
      declarationId: 543,
    },
  ],
}

const declarationWithEmployersAndHighWorkHours = {
  ...declarationWithEmployers,
  employers: [
    {
      employerName: 'Test',
      workHours: 500, // should be sent as MAX_DECLARABLE_HOURS
      salary: 34,
      hasEndedThisMonth: false,
      id: 1735,
      userId: 165,
      declarationId: 543,
    },
  ],
}

const declarationWithoutEmployers = {
  hasWorked: false,
  hasTrained: false,
  hasInternship: false,
  hasSickLeave: false,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
  jobSearchStopMotive: null,
  ignoreErrors: false,
  userId: 165,
  monthId: 8,
  hasFinishedDeclaringEmployers: true,
  isTransmitted: false,
  isFinished: false,
}

const declarationWithAllDatesFilled = {
  id: 543,
  userId: 165,
  hasWorked: true,
  hasTrained: false,
  hasInternship: true,
  dates: [
    {
      type: 'internship',
      startDate: '2018-12-11T23:00:00.000Z',
      endDate: '2019-01-10T23:00:00.000Z',
    },
    {
      type: 'sickLeave',
      startDate: '2018-12-17T23:00:00.000Z',
      endDate: '2019-01-18T23:00:00.000Z',
    },
    {
      type: 'maternityLeave',
      startDate: '2018-12-23T23:00:00.000Z',
    },
    {
      type: 'retirement',
      startDate: '2018-12-18T23:00:00.000Z',
    },
    {
      type: 'invalidity',
      startDate: '2018-12-24T23:00:00.000Z',
    },
    {
      type: 'jobSearch',
      endDate: '2018-12-25T23:00:00.000Z',
    },
  ],
  hasSickLeave: true,
  hasMaternityLeave: true,
  hasRetirement: true,
  hasInvalidity: true,
  isLookingForJob: false,
  jobSearchStopMotive: 'work',
  hasFinishedDeclaringEmployers: true,
  isFinished: false,
  createdAt: '2019-01-02T15:55:29.957Z',
  updatedAt: '2019-01-07T11:54:01.296Z',
  monthId: 8,
  isTransmitted: false,
  isEmailSent: false,
  isDocEmailSent: false,
  employers: [
    {
      employerName: 'IUI',
      workHours: 232,
      salary: 41,
      hasEndedThisMonth: true,
      userId: 165,
      declarationId: 543,
    },
    {
      employerName: 'Test',
      workHours: 23,
      salary: 34,
      hasEndedThisMonth: false,
      id: 1735,
      userId: 165,
      declarationId: 543,
    },
  ],
}

const declarationWithJobSearchMotiveRetirement = {
  ...declarationWithAllDatesFilled,
  jobSearchStopMotive: 'retirement',
}
const declarationWithJobSearchMotiveOther = {
  ...declarationWithAllDatesFilled,
  jobSearchStopMotive: 'other',
}

const declarationWithMultipleSicknessAndInternshipDates = {
  ...declarationWithoutEmployers,
  hasSickLeave: true,
  hasInternship: true,
  dates: [
    {
      type: 'internship',
      startDate: '2018-12-01T23:00:00.000Z',
      endDate: '2018-12-08T23:00:00.000Z',
    },
    {
      type: 'internship',
      startDate: '2018-12-11T23:00:00.000Z',
      endDate: '2019-01-10T23:00:00.000Z',
    },
    {
      type: 'sickLeave',
      startDate: '2018-12-02T23:00:00.000Z',
      endDate: '2018-12-08T23:00:00.000Z',
    },
    {
      type: 'sickLeave',
      startDate: '2018-12-17T23:00:00.000Z',
      endDate: '2019-01-18T23:00:00.000Z',
    },
  ],
}

const accessToken = 'AZERTYUIOP'

describe('PE API: sendDeclaration', () => {
  let scope
  let parsedBody
  let parsedHeaders

  describe('API call success', () => {
    beforeAll(() => {
      scope = nock(config.apiHost)
        .post(
          '/partenaire/peconnect-actualisation/v1/actualisation',
          (body) => {
            parsedBody = body
            return body
          },
        )
        .reply(function() {
          parsedHeaders = this.req.headers
          return [200, { statut: DECLARATION_STATUSES.SAVED }]
        })
        .persist()
    })

    afterAll(() => scope.persist(false))

    it('should send formatted data for declarations', async () => {
      const declarations = [
        declarationWithEmployers,
        declarationWithEmployersAndHighWorkHours,
        declarationWithoutEmployers,
        declarationWithAllDatesFilled,
        declarationWithJobSearchMotiveRetirement,
        declarationWithJobSearchMotiveOther,
        declarationWithMultipleSicknessAndInternshipDates,
      ]

      for (const declaration of declarations) {
        const {
          body: { statut },
        } = await sendDeclaration({
          declaration,
          accessToken,
          // Arbitrary, just to set forceIncoherences to true once
          ignoreErrors: declaration.jobSearchStopMotive === 'other',
        })
        expect(statut).toEqual(DECLARATION_STATUSES.SAVED)
        expect(parsedHeaders).toMatchSnapshot()
        expect(parsedBody).toMatchSnapshot()
      }
    })
  })

  describe('API call failure', () => {
    beforeEach(() =>
      nock(config.apiHost)
        .post('/partenaire/peconnect-actualisation/v1/actualisation')
        .reply(500, {
          statut: 'Everything has exploded',
        }))
    it('should fail if there was a server error', () => {
      sendDeclaration({
        declaration: declarationWithEmployers,
        accessToken,
      }).catch((err) => expect(err).toBeDefined())
    })
  })
})
