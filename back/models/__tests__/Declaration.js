const DeclarationMonth = require('../DeclarationMonth')
const Declaration = require('../Declaration')
const User = require('../User')

let user

const validDeclaration = {
  hasWorked: true,
  hasTrained: false,
  hasInternship: false,
  hasSickLeave: false,
  hasMaternityLeave: false,
  hasRetirement: false,
  hasInvalidity: false,
  isLookingForJob: true,
}

describe('Declaration Model', () => {
  beforeAll(() =>
    Promise.all([
      User.query().insertAndFetch({
        peId: 'abcde12345',
        firstName: 'Hugo',
        lastName: 'Agbonon',
        email: 'pom@pom.com',
      }),
      DeclarationMonth.query().first(),
    ]).then(([savedUser, declarationMonth]) => {
      user = savedUser
      validDeclaration.monthId = declarationMonth.id
    }),
  )
  afterAll(() => User.knex().raw('TRUNCATE "Users" CASCADE'))

  afterEach(() => Declaration.knex().raw('TRUNCATE "declarations" CASCADE'))

  describe('Validation', () => {
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

    describe('isLookingForJob', () => {
      let lookingForJobDeclaration

      beforeAll(() => {
        // validDeclaration is populated in an upper level beforeAll,
        // so the spread won't get all the values if we don't write this in another beforeAll
        lookingForJobDeclaration = {
          ...validDeclaration,
          isLookingForJob: false,
        }
      })

      test('rejects without a motive', () =>
        checkInvalidDeclaration(lookingForJobDeclaration))
    })
  })
})
