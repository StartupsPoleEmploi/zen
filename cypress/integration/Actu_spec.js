import {
  YES,
  NO,
  defaultValues,
  fillFormAnswers,
  checkFormValues,
  pickDate,
  checkDate,
  getNextButton,
} from '../pages/Actu'

const { omit } = Cypress._

describe('Declaration page', function() {
  // Set the day to not the current day because if you select the current date the modal will not close.
  // you will have to click on ok
  const currentDate = new Date().getDate()
  const startDay = currentDate === 20 ? '19' : '20'
  const endDay = currentDate === 21 ? '22' : '21'

  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('POST', '/api/tests/db/reset')
  })

  describe('Entrepreneur warning', () => {
    beforeEach(() => {
      cy.viewport(1400, 1600)
      cy.visit('/actu')
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
      cy.viewport(1400, 1600)
      cy.visit('/actu')
    })

    describe('Form errors', () => {
      // Test all possible missing answers
      it('should have validation button disabled if any answer is missing', () => {
        Object.keys(defaultValues).forEach((keyToOmit) => {
          const inputsToFill = omit(defaultValues, keyToOmit)
          fillFormAnswers(inputsToFill)

          getNextButton().should('be.disabled')

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

          getNextButton().click()

          cy.get('p[role=alert]').should('be.visible')

          if (
            fieldToTest === 'hasInternship' ||
            fieldToTest === 'hasSickLeave'
          ) {
            // Additional check for these:
            // Errors should be displayed if the dates are given in reverse order

            pickDate(fieldToTest, endDay)
            pickDate(fieldToTest, startDay, { last: true })

            getNextButton().click()

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
        getNextButton().click()

        cy.url().should('contain', '/employers')

        // Go back to the page and check that the values in the form are there
        cy.get('a[href="/actu"')
          .first()
          .click()
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

        pickDate('hasInternship', startDay)
        pickDate('hasInternship', endDay, { last: true })
        pickDate('hasSickLeave', startDay)
        pickDate('hasSickLeave', endDay, { last: true })
        pickDate('hasMaternityLeave', startDay)
        pickDate('hasRetirement', startDay)
        pickDate('hasInvalidity', startDay)
        pickDate('isLookingForJob', startDay)

        getNextButton().click()
        cy.url().should('contain', '/employers')

        // Go back to the page and check that the values in the form are there
        // We check these because we've had some timezone issues.
        cy.get('a[href="/actu"')
          .first()
          .click()
        checkFormValues(values)
        checkDate('hasInternship', startDay)
        checkDate('hasInternship', endDay, { last: true })
        checkDate('hasSickLeave', startDay)
        checkDate('hasSickLeave', endDay, { last: true })
        checkDate('hasMaternityLeave', startDay)
        checkDate('hasRetirement', startDay)
        checkDate('hasInvalidity', startDay)
        checkDate('isLookingForJob', startDay)
      })

      it(`should warn the user before transmission if they haven't worked`, () => {
        fillFormAnswers({ ...defaultValues, hasWorked: NO })
        // Open modal
        getNextButton().click()

        // Close modal
        cy.get('div[role=dialog] button')
          .contains('Non, je modifie')
          .click()

        // Re-open modal
        getNextButton().click()

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

        getNextButton().click()
        cy.url().should('contain', '/employers')
      })

      it('should not display the maternityLeave field if the user is a male', () => {
        cy.request('POST', '/api/tests/db/reset', {
          userOverride: { gender: 'male', firstName: 'Sally' },
        })
        cy.reload()

        fillFormAnswers(omit(defaultValues, 'hasMaternityLeave'))
        cy.get('#hasMaternityLeave').should('not.exist')

        getNextButton().click()
        cy.url().should('contain', '/employers')
      })
    })
  })
})
