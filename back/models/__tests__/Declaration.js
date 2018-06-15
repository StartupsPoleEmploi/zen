const { startOfMonth, endOfMonth, subMonths, addMonths } = require('date-fns')
const Declaration = require('../Declaration')
const User = require('../User')

let user
const now = new Date()
const pastDate = startOfMonth(now)
const futureDate = endOfMonth(now)
const previousMonth = subMonths(now, 1)
const nextMonth = addMonths(now, 1)

describe('Declaration Model', () => {
  beforeAll(() =>
    User.query()
      .insertAndFetch({
        peId: 'abcde12345',
        firstName: 'Hugo',
        lastName: 'Agbonon',
        email: 'pom@pom.com',
      })
      .then((savedUser) => {
        user = savedUser
      }))
  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE'))

  afterEach(() => Declaration.knex().raw('TRUNCATE "Declarations" CASCADE'))

  describe('Validation', () => {
    const validDeclaration = {
      declaredMonth: now,
      hasWorked: true,
      hasTrained: false,
      hasInternship: false,
      hasSickLeave: false,
      hasMaternityLeave: false,
      hasRetirement: false,
      hasInvalidity: false,
      isLookingForJob: true,
    }
    // Checks if declaration is valid by saving it.
    const checkValidDeclaration = (declaration) =>
      Declaration.query().insert({ ...declaration, userId: user.id })

    const checkInvalidDeclaration = (declaration) =>
      Declaration.query()
        .insert({ ...declaration, userId: user.id })
        .then(() => {
          throw new Error('This should not validate')
        })
        .catch((err) => {
          if (err.type === 'DeclarationValidationError') return
          throw new Error(err)
        })

    test('accepts classic declaration', () =>
      checkValidDeclaration(validDeclaration))

    test('rejects empty declaration', () => checkInvalidDeclaration({}))

    const fieldsToTest = [
      {
        baseField: 'training',
        boolField: 'hasTrained',
        dateFields: ['trainingStartDate', 'trainingEndDate'],
      },
      {
        baseField: 'internship',
        boolField: 'hasInternship',
        dateFields: ['internshipStartDate', 'internshipEndDate'],
      },
      {
        baseField: 'sickLeave',
        boolField: 'hasSickLeave',
        dateFields: ['sickLeaveStartDate', 'sickLeaveEndDate'],
      },
      {
        baseField: 'maternityLeave',
        boolField: 'hasMaternityLeave',
        dateFields: ['maternityLeaveStartDate'],
      },
      {
        baseField: 'retirement',
        boolField: 'hasRetirement',
        dateFields: ['retirementStartDate'],
      },
      {
        baseField: 'invalidity',
        boolField: 'hasInvalidity',
        dateFields: ['invalidityStartDate'],
      },
    ]

    fieldsToTest.forEach(
      ({
        baseField,
        boolField,
        dateFields: [startDateLabel, endDateLabel],
      }) => {
        describe(baseField, () => {
          const baseDeclaration = {
            ...validDeclaration,
            [boolField]: true,
          }

          test(`rejects ${baseField} without dates`, () =>
            checkInvalidDeclaration(baseDeclaration))

          test(`rejects ${baseField} without starting date`, () =>
            checkInvalidDeclaration({
              ...baseDeclaration,
              [endDateLabel]: futureDate,
            }))

          if (!endDateLabel) {
            test.skip(`rejects ${baseField} with start date out of declared month`, () =>
              checkInvalidDeclaration({
                ...baseDeclaration,
                [startDateLabel]: previousMonth,
              }))
          }

          if (endDateLabel) {
            test(`rejects ${baseField} without ending date`, () =>
              checkInvalidDeclaration({
                ...baseDeclaration,
                [startDateLabel]: pastDate,
              }))

            test(`accepts ${baseField} with both dates`, () =>
              checkValidDeclaration({
                ...baseDeclaration,
                [startDateLabel]: pastDate,
                [endDateLabel]: futureDate,
              }))

            // TODO activate when implemented
            test.skip(`rejects ${baseField} with out of order dates`, () =>
              checkInvalidDeclaration({
                ...baseDeclaration,
                [startDateLabel]: futureDate,
                [endDateLabel]: pastDate,
              }))

            // TODO activate when implemented
            test.skip(`rejects ${baseField} with start date out of declared month`, () =>
              checkInvalidDeclaration({
                ...baseDeclaration,
                [startDateLabel]: previousMonth,
                [endDateLabel]: pastDate,
              }))

            // TODO activate when implemented
            test.skip(`rejects ${baseField} with end date out of declared month`, () =>
              checkInvalidDeclaration({
                ...baseDeclaration,
                [startDateLabel]: futureDate,
                [endDateLabel]: nextMonth,
              }))
          }
        })
      },
    )

    describe('isLookingForJob', () => {
      const lookingForJobDeclaration = {
        ...validDeclaration,
        isLookingForJob: false,
      }

      test('rejects without a date and a motive', () =>
        checkInvalidDeclaration(lookingForJobDeclaration))

      test('rejects with only a motive', () =>
        checkInvalidDeclaration({
          ...lookingForJobDeclaration,
          motive: 'work',
        }))

      test('rejects with only an end date', () =>
        checkInvalidDeclaration({
          ...lookingForJobDeclaration,
          jobSearchEndDate: now,
        }))

      test('accepts with required fields', () =>
        checkInvalidDeclaration({
          ...lookingForJobDeclaration,
          motive: 'work',
          jobSearchEndDate: now,
        }))
    })
  })
})
