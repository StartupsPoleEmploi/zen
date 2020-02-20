import { fillForm, validateForm } from '../pages/AddEmail'

describe('AddEmail page', function() {
  beforeEach(() => {
    cy.request('POST', '/api/tests/db/reset-for-signup?authorizeUser=true', {
      userOverride: { email: '' },
    })
    cy.viewport(1400, 1600)
    cy.visit('/add-email')

    cy.get('h1')
      .contains("Merci pour votre demande d'inscription")
      .click()
  })

  it('should not allowed validation if form is empty', () => {
    fillForm({
      mail: '',
      mailConfirmation: '',
    })
    validateForm()

    cy.get('p')
      .contains("Merci d'entrer une adresse e-mail valide")
      .should('have.length', 1)
  })

  it('should not allowed validation if email is invalid', () => {
    fillForm({
      mail: 'azerty',
      mailConfirmation: 'mail@mail.fr',
    })
    validateForm()

    cy.get('p')
      .contains("Merci d'entrer une adresse e-mail valide")
      .should('have.length', 1)
  })

  it('should not allowed validation if there is no confirm email', () => {
    fillForm({
      mail: 'mail@mail.fr',
      mailConfirmation: '',
    })
    validateForm()

    cy.get('p')
      .contains('Les deux adresses e-mails ne sont pas identiques')
      .should('have.length', 1)
  })
})
