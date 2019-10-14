export const employerQuestion = (employerIndex) =>
  cy.get('.employer-question').eq(employerIndex)

export const addNewEmployer = () =>
  cy
    .get('button')
    .contains('Ajouter un employeur')
    .click({ force: true })

export const removeEmployerLine = ({ employerIndex = 0 }) =>
  employerQuestion(employerIndex)
    .find('button[aria-label=Supprimer]')
    .click()

export const checkTotalHoursAndSalary = ({ hoursExpected, salaryExpected }) => {
  cy.get('li.work-hours-total')
    .contains('Heures déclarées')
    .parent()
    // eslint-disable-next-line no-irregular-whitespace
    .should('contain', `Heures déclarées : ${hoursExpected} h`)

  cy.get('li.salary-total')
    .contains('Salaire brut déclaré')
    .parent()
    // eslint-disable-next-line no-irregular-whitespace
    .should('contain', `Salaire brut déclaré : ${salaryExpected} €`)
}

export const sendDeclaration = () => {
  cy.get('button')
    .contains('Envoyer mon')
    .click()
}

export const getSummaryModal = () => cy.get('div[role=dialog]')

export const checkModalContent = ({ employerList = [], salaryTotal = 0 }) => {
  getSummaryModal()
    .find('h2')
    .should('have.text', "Envoi de l'actualisation")

  getSummaryModal()
    .find('.employer-declared-list li')
    .should('have.length', 2)
    .each(($el, index) => {
      cy.wrap($el).should('have.text', employerList[index])
    })

  getSummaryModal()
    .find('.total-salary-declared')
    .should('have.text', salaryTotal)
}

export const checkGlobalFormErrorMessageExists = () =>
  cy
    .get('p')
    .contains('Merci de corriger les erreurs du formulaire')
    .should('have.length', 1)

export const checkEmployerLineValues = ({
  employerIndex = 0,
  employerName,
  workHours,
  salary,
}) => {
  employerQuestion(employerIndex)
    .find(`input[name="employerName[${employerIndex}]"]`)
    .should('have.value', employerName)

  employerQuestion(employerIndex)
    .find(`input[name="workHours[${employerIndex}]"]`)
    .should('have.value', workHours)

  employerQuestion(employerIndex)
    .find(`input[name="salary[${employerIndex}]"]`)
    .should('have.value', salary)
}

export const fillEmployerForm = ({
  employerName,
  workHours,
  salary,
  employerEndThisMonth,
  employerIndex = 0,
}) => {
  // For errors testing purpose, we allow empty value in form arguments

  if (employerName) {
    employerQuestion(employerIndex)
      .find(`input[name="employerName[${employerIndex}]"]`)
      .type(employerName)
  }

  if (workHours) {
    employerQuestion(employerIndex)
      .find(`input[name="workHours[${employerIndex}]"]`)
      .type(workHours)
      .blur()
  }

  if (salary) {
    employerQuestion(employerIndex)
      .find(`input[name="salary[${employerIndex}]"]`)
      .type(salary)
      .blur()
  }

  if (employerEndThisMonth) {
    employerQuestion(employerIndex)
      .find(
        `input[name="hasEndedThisMonth[${employerIndex}]"][value=${employerEndThisMonth}]`,
      )
      .click()
  }
}
