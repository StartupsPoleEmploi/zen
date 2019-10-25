export const YES = 'yes'
export const NO = 'no'

export const defaultValues = {
  hasWorked: YES,
  hasTrained: NO,
  hasInternship: NO,
  hasSickLeave: NO,
  hasMaternityLeave: NO,
  hasRetirement: NO,
  hasInvalidity: NO,
  isLookingForJob: YES,
}

export const fillFormAnswers = (values) => {
  Object.keys(values).forEach((fieldName) => {
    cy.get(`input[name=${fieldName}][value=${values[fieldName]}]`).click()
  })
}

export const checkFormValues = (values) => {
  Object.keys(values).forEach((fieldName) => {
    cy.get(`input[name=${fieldName}][value=${values[fieldName]}]:checked`)
  })
}

export const pickDate = (fieldName, value, { last } = { last: false }) => {
  cy.get(`#${fieldName} input[type=text]`)
    [!last ? 'first' : 'last']()
    .click()
  cy.get('button')
    .contains(new RegExp(`\\b${value}\\b`))
    .click()
}

export const checkDate = (fieldName, value, { last } = { last: false }) => {
  cy.get(`#${fieldName} input[type=text]`)
    [!last ? 'first' : 'last']()
    // We check that the day we chose is correctly selected (for "20/09/2019", we match the "20/" part)
    .should((input) => {
      expect(input[0].value).to.match(new RegExp(`^${value}/`))
    })
}

export const getNextButton = () =>
  cy
    .get('button')
    .contains('Suivant')
    .parent('button')
