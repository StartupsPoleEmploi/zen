export const fillForm = ({ mail, mailConfirmation }) => {
  if (mail) cy.get('input[name=email]').type(mail)
  if (mailConfirmation) {
    cy.get('input[name=email-confirmation]').type(mailConfirmation)
  }
}

export const validateForm = () =>
  cy
    .get('button')
    .contains('Valider')
    .click()
