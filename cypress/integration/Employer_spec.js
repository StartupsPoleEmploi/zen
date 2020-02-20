import {
  fillEmployerForm,
  addNewEmployer,
  removeEmployerLine,
  sendDeclaration,
  checkTotalHoursAndSalary,
  checkGlobalFormErrorMessageExists,
  checkModalContent,
  checkEmployerLineValues,
} from '../pages/Employer'

describe('Employers page', function() {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('POST', '/api/tests/db/reset-for-employers')
  })

  describe('Employers => ', () => {
    beforeEach(() => {
      cy.viewport(1400, 1600)
      cy.visit('/employers')
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500)
      cy.get('h1').should(
        'contain',
        'Pour quels employeurs avez-vous travaillé',
      )
    })

    it('should add a new employer', () => {
      cy.get('.employer-question').should('have.length', 1)
      addNewEmployer()
      cy.get('.employer-question').should('have.length', 2)
      addNewEmployer()
      cy.get('.employer-question').should('have.length', 3)
    })

    it('should not allowed letters in salary', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 37,
        salary: 'Hello',
        employerEndThisMonth: 'no',
      })
      checkEmployerLineValues({
        employerName: 'John Doe',
        workHours: '37h',
        salary: '',
      })
      sendDeclaration()
      checkGlobalFormErrorMessageExists()
    })

    it('should remove a employer line', () => {
      addNewEmployer()
      addNewEmployer()
      cy.get('.employer-question').should('have.length', 3)
      removeEmployerLine({ employerIndex: 0 })
      cy.get('.employer-question').should('have.length', 2)
      removeEmployerLine({ employerIndex: 0 })
      cy.get('.employer-question').should('have.length', 1)
    })

    it('should fill the form correctly', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 30,
        salary: 300,
      })
      checkTotalHoursAndSalary({ hoursExpected: 30, salaryExpected: 300 })
    })

    it('should send the actualisation - when "yes" is given in "employerEndThisMonth"', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 30,
        salary: 300,
        employerEndThisMonth: 'no',
      })
      addNewEmployer()
      fillEmployerForm({
        employerName: 'James Bond',
        workHours: 37,
        salary: 450,
        employerIndex: 1,
        employerEndThisMonth: 'no',
      })

      sendDeclaration()
      checkModalContent({
        employerList: ['John Doe', 'James Bond'],
        salaryTotal: '750 €',
      })
    })

    it('should display error message if no name given', () => {
      fillEmployerForm({
        workHours: 30,
        salary: 300,
        employerEndThisMonth: 'no',
      })
      sendDeclaration()

      cy.get('#employerName\\[0\\]-helper-text')
        .contains('Champ obligatoire')
        .should('have.length', 1)
      checkGlobalFormErrorMessageExists()
    })
    it('should display error message if no workhours given', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        salary: 300,
        employerEndThisMonth: 'no',
      })
      sendDeclaration()

      cy.get('#workHours\\[0\\]-helper-text')
        .contains('Champ obligatoire')
        .should('have.length', 1)

      checkGlobalFormErrorMessageExists()
    })

    it('should display error message if no salary given', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 30,
        employerEndThisMonth: 'no',
      })
      sendDeclaration()

      cy.get('#salary\\[0\\]-helper-text')
        .contains('Champ obligatoire')
        .should('have.length', 1)
      checkGlobalFormErrorMessageExists()
    })

    it('should display error message if no employerEndThisMonth given', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 30,
        salary: 300,
      })
      sendDeclaration()
      cy.get('p')
        .contains('Champ obligatoire')
        .should('have.length', 1)
      checkGlobalFormErrorMessageExists()
    })

    it('should compute work hours and salary totals correctly', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 30,
        salary: 300,
        employerEndThisMonth: 'no',
      })

      addNewEmployer()
      fillEmployerForm({
        employerName: 'James Bond',
        workHours: 37,
        salary: 450,
        employerIndex: 1,
        employerEndThisMonth: 'no',
      })
      checkTotalHoursAndSalary({ hoursExpected: 67, salaryExpected: 750 })

      removeEmployerLine({ employerIndex: 0 })
      checkTotalHoursAndSalary({ hoursExpected: 37, salaryExpected: 450 })
    })

    it('should not allowed letter in work hours', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 'Hello',
        salary: 300,
        employerEndThisMonth: 'no',
      })
      checkEmployerLineValues({
        employerName: 'John Doe',
        workHours: '',
        salary: '300,00€ brut',
      })
    })
    it('should limit work hours input length to 3 numbers', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 111999,
        salary: 300,
        employerEndThisMonth: 'no',
      })
      checkEmployerLineValues({
        employerName: 'John Doe',
        workHours: '111h',
        salary: '300,00€ brut',
      })
    })

    it('should limit salary input length to 99999', () => {
      fillEmployerForm({
        employerName: 'John Doe',
        workHours: 37,
        salary: 100000,
        employerEndThisMonth: 'no',
      })
      cy.get('#salary\\[0\\]-helper-text')
        .contains('Merci de corriger votre salaire')
        .should('have.length', 1)
      sendDeclaration()
      checkGlobalFormErrorMessageExists()
    })
  })
})
