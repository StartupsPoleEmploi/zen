const { omit } = Cypress._

const YES = 'yes'
const NO = 'no'

const defaultValues = {
  hasWorked: YES,
  hasTrained: NO,
  hasInternship: NO,
  hasSickLeave: NO,
  hasMaternityLeave: NO,
  hasRetirement: NO,
  hasInvalidity: NO,
  isLookingForJob: YES,
}

const fillFormAnswers = (values) => {
  Object.keys(values).forEach((fieldName) => {
    cy.get(`input[name=${fieldName}][value=${values[fieldName]}]`).click()
  })
}

const checkFormValues = (values) => {
  Object.keys(values).forEach((fieldName) => {
    cy.get(`input[name=${fieldName}][value=${values[fieldName]}]:checked`)
  })
}

const pickDate = (fieldName, value, { last } = { last: false }) => {
  cy.get(`#${fieldName} input[type=text]`)
    [!last ? 'first' : 'last']()
    .click()
  cy.get('button')
    .contains(value)
    .click()
}

const checkDate = (fieldName, value, { last } = { last: false }) => {
  cy.get(`#${fieldName} input[type=text]`)
    [!last ? 'first' : 'last']()
    // We check that the day we chose is correctly selected (for "20/09/2019", we match the "20/" part)
    .should((input) => {
      expect(input[0].value).to.match(new RegExp(`^${value}/`))
    })
}

const clickNextLink = () =>
  cy
    .get('button')
    .contains('Suivant')
    .click()

describe('Declaration page', function() {
  before(() => {
    cy.clearCookies()

    // This request's only use is to initialize the csurf token server-side
    cy.request({
      url: '/api/user',
      method: 'GET',
      failOnStatusCode: false,
    })
  })

  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('POST', '/api/tests/db/reset')
  })

  describe('Entrepreneur warning', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.url().should('contain', '/actu')
    })

    it('Displays the entrepreneur warning', function() {
      cy.contains(`créateur / créatrice d'entreprise`)
      cy.get('button')
        .contains(`J'ai compris`)
        .click()

      // If correctly validated, we're now on the déclaration page
      cy.contains('Déclarer ma situation')
    })
  })

  describe('Declaration form', () => {
    beforeEach(() => {
      window.localStorage.setItem(
        'canUseService',
        JSON.stringify({
          validatedForMonth: new Date().toISOString(),
          shouldAskAgain: true,
        }),
      )
      cy.visit('/')
      cy.url().should('contain', '/actu')
    })

    describe('Form errors', () => {
      // Test all possible missing answers
      it('should not validate if any answer is missing', () => {
        Object.keys(defaultValues).forEach((keyToOmit) => {
          const inputsToFill = omit(defaultValues, keyToOmit)
          fillFormAnswers(inputsToFill)

          clickNextLink()

          cy.get('p[role=alert]')
            .contains('Merci de répondre à toutes les questions')
            .should('be.visible')

          cy.reload()
        })
      })

      // Test all possible missing dates
      it('should not validate if any required date is missing', () => {
        const fieldsToTest = [
          'hasInternship',
          'hasSickLeave',
          'hasMaternityLeave',
          'hasRetirement',
          'hasInvalidity',
          'isLookingForJob',
        ]

        fieldsToTest.forEach((fieldToTest) => {
          fillFormAnswers({
            ...defaultValues,
            [fieldToTest]: fieldToTest === 'isLookingForJob' ? NO : YES,
          })
          if (fieldToTest === 'isLookingForJob') {
            cy.get('#isLookingForJob input[name=search]')
              .first()
              .click()
          }

          clickNextLink()

          cy.get('p[role=alert]').should('be.visible')

          if (
            fieldToTest === 'hasInternship' ||
            fieldToTest === 'hasSickLeave'
          ) {
            // Additional check for these:
            // Errors should be displayed if the dates are given in reverse order

            pickDate(fieldToTest, '21')
            pickDate(fieldToTest, '20', { last: true })

            clickNextLink()

            cy.get('p[role=alert]')
              .contains('Merci de corriger')
              .should('be.visible')
          }

          cy.reload()
        })
      })
    })

    describe('Valid form', () => {
      it('should validate for default declaration', () => {
        fillFormAnswers(defaultValues)
        clickNextLink()

        cy.url().should('contain', '/employers')

        // Go back to the page and check that the values in the form are there
        cy.get('a[href="/actu"').click()
        checkFormValues(defaultValues)
      })

      it('should allow filling the dates of all fields', () => {
        const values = {
          ...defaultValues,
          hasInternship: YES,
          hasSickLeave: YES,
          hasMaternityLeave: YES,
          hasRetirement: YES,
          hasInvalidity: YES,
          isLookingForJob: NO,
        }

        fillFormAnswers(values)
        cy.get('#isLookingForJob input[name=search]')
          .first()
          .click()

        pickDate('hasInternship', '20')
        pickDate('hasInternship', '21', { last: true })
        pickDate('hasSickLeave', '20')
        pickDate('hasSickLeave', '21', { last: true })
        pickDate('hasMaternityLeave', '20')
        pickDate('hasRetirement', '20')
        pickDate('hasInvalidity', '20')
        pickDate('isLookingForJob', '20')

        clickNextLink()
        cy.url().should('contain', '/employers')

        // Go back to the page and check that the values in the form are there
        // We check these because we've had some timezone issues.
        cy.get('a[href="/actu"').click()
        checkFormValues(values)
        checkDate('hasInternship', '20')
        checkDate('hasInternship', '21', { last: true })
        checkDate('hasSickLeave', '20')
        checkDate('hasSickLeave', '21', { last: true })
        checkDate('hasMaternityLeave', '20')
        checkDate('hasRetirement', '20')
        checkDate('hasInvalidity', '20')
        checkDate('isLookingForJob', '20')
      })

      it(`should warn the user before transmission if they haven't worked`, () => {
        fillFormAnswers({ ...defaultValues, hasWorked: NO })
        // Open modal
        clickNextLink()

        // Close modal
        cy.get('div[role=dialog] button')
          .contains('Non, je modifie')
          .click()

        // Re-open modal
        clickNextLink()

        cy.get('div[role=dialog] button')
          .contains('Oui, je confirme')
          .click()

        cy.url().should('contain', '/files')
      })

      it('should not display the isLookingForJob question if user trained', () => {
        fillFormAnswers({
          ...omit(defaultValues, 'isLookingForJob'),
          hasTrained: YES,
        })

        cy.get('#isLookingForJob').should('not.exist')

        clickNextLink()
        cy.url().should('contain', '/employers')
      })

      it('should not display the maternityLeave field if the user is a male', () => {
        cy.request('POST', '/api/tests/db/reset', {
          userOverride: { gender: 'male', firstName: 'Sally' },
        })
        cy.reload()

        fillFormAnswers(omit(defaultValues, 'hasMaternityLeave'))
        cy.get('#hasMaternityLeave').should('not.exist')

        clickNextLink()
        cy.url().should('contain', '/employers')
      })
    })
  })
})
