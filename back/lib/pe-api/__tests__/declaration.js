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
  internshipStartDate: null,
  internshipEndDate: null,
  internshipDocumentId: null,
  hasSickLeave: false,
  sickLeaveStartDate: null,
  sickLeaveEndDate: null,
  sickLeaveDocumentId: null,
  hasMaternityLeave: false,
  maternityLeaveStartDate: null,
  maternityLeaveDocumentId: null,
  hasRetirement: false,
  retirementStartDate: null,
  retirementDocumentId: null,
  hasInvalidity: false,
  invalidityStartDate: null,
  invalidityDocumentId: null,
  isLookingForJob: true,
  jobSearchEndDate: null,
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

const declarationWithoutEmployers = {
  hasWorked: false,
  hasTrained: false,
  hasInternship: false,
  internshipStartDate: '2018-12-12',
  internshipEndDate: '2019-01-11',
  hasSickLeave: false,
  sickLeaveStartDate: null,
  sickLeaveEndDate: null,
  hasMaternityLeave: false,
  maternityLeaveStartDate: null,
  hasRetirement: false,
  retirementStartDate: null,
  hasInvalidity: false,
  invalidityStartDate: '2018-12-25',
  isLookingForJob: true,
  jobSearchEndDate: null,
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
  internshipStartDate: '2018-12-11T23:00:00.000Z',
  internshipEndDate: '2019-01-10T23:00:00.000Z',
  internshipDocumentId: null,
  hasSickLeave: true,
  sickLeaveStartDate: '2018-12-17T23:00:00.000Z',
  sickLeaveEndDate: '2019-01-18T23:00:00.000Z',
  sickLeaveDocumentId: null,
  hasMaternityLeave: true,
  maternityLeaveStartDate: '2018-12-23T23:00:00.000Z',
  maternityLeaveDocumentId: null,
  hasRetirement: true,
  retirementStartDate: '2018-12-18T23:00:00.000Z',
  retirementDocumentId: null,
  hasInvalidity: true,
  invalidityStartDate: '2018-12-24T23:00:00.000Z',
  invalidityDocumentId: null,
  isLookingForJob: false,
  jobSearchEndDate: '2018-12-25T23:00:00.000Z',
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
        declarationWithoutEmployers,
        declarationWithAllDatesFilled,
        declarationWithJobSearchMotiveRetirement,
        declarationWithJobSearchMotiveOther,
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
        }),
    )
    it('should fail if there was a server error', () => {
      sendDeclaration({
        declaration: declarationWithEmployers,
        accessToken,
      }).catch((err) => expect(err).toBeDefined())
    })
  })
})
