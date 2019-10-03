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
  infos: [
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
  infos: [
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
const userId = 1

describe('PE API: sendDeclaration', () => {
  describe('API call success', () => {
    it('should send formatted data for declarations', async () => {
      let parsedBody
      let parsedHeaders

      const declarations = [
        declarationWithEmployers,
        declarationWithEmployersAndHighWorkHours,
        declarationWithoutEmployers,
        declarationWithAllDatesFilled,
        declarationWithJobSearchMotiveRetirement,
        declarationWithJobSearchMotiveOther,
        declarationWithMultipleSicknessAndInternshipDates,
      ]

      const scope = nock(config.apiHost)
        .post(
          '/partenaire/peconnect-actualisation/v1/actualisation',
          (body) => {
            parsedBody = body
            return body
          },
        )
        .times(declarations.length)
        .reply(function() {
          parsedHeaders = this.req.headers
          return [200, { statut: DECLARATION_STATUSES.SAVED }]
        })

      for (const declaration of declarations) {
        const {
          body: { statut },
        } = await sendDeclaration({
          declaration,
          accessToken,
          userId,
          // Arbitrary, just to set forceIncoherences to true once
          ignoreErrors: declaration.jobSearchStopMotive === 'other',
        })
        expect(statut).toEqual(DECLARATION_STATUSES.SAVED)
        expect(parsedHeaders).toMatchSnapshot()
        expect(parsedBody).toMatchSnapshot()
      }
      scope.done()
    })
  })

  describe('API call failure', () => {
    it('should fail if there was a server error', (done) => {
      const scope = nock(config.apiHost)
        .post('/partenaire/peconnect-actualisation/v1/actualisation')
        .reply(500, {
          statut: DECLARATION_STATUSES.TECH_ERROR,
          message: 'Everything just exploded',
        })
      sendDeclaration({
        declaration: declarationWithEmployers,
        accessToken,
        userId,
      }).catch((err) => {
        expect(err).toBeDefined()
        scope.done()
        done()
      })
    })

    it('should retry multiple times if there was a status "impossible or unavailable" as an answer', (done) => {
      const scope = nock(config.apiHost)
        .post('/partenaire/peconnect-actualisation/v1/actualisation')
        .times(3)
        .reply(200, {
          statut: DECLARATION_STATUSES.IMPOSSIBLE_OR_UNNECESSARY,
          message: 'Actualisation non effectuée',
        })
      sendDeclaration({
        declaration: declarationWithEmployers,
        accessToken,
        userId,
      }).then(({ body }) => {
        expect(body.statut === DECLARATION_STATUSES.IMPOSSIBLE_OR_UNNECESSARY)
        scope.done()
        done()
      })
    })
  })
})
