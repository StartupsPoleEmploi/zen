// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// UTILS
// GET from : https://stackoverflow.com/questions/47074225/how-to-test-file-inputs-with-cypress
function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array()
  }

  const a = []
  for (let i = 0, len = str.length; i < len; i += 2) {
    a.push(parseInt(str.substr(i, 2), 16))
  }

  return new Uint8Array(a)
}

Cypress.Commands.add(
  'uploadFile',
  (fileName, fileType, parentSelector, elIndex = 0) => {
    cy.get(parentSelector)
      .eq(elIndex)
      .find('input[type=file]')
      .then((subject) => {
        cy.fixture(fileName, 'hex').then((fileHex) => {
          const fileBytes = hexStringToByte(fileHex)
          const testFile = new File([fileBytes], fileName, {
            type: fileType,
          })
          const dataTransfer = new DataTransfer()
          const el = subject[0]

          dataTransfer.items.add(testFile)
          el.files = dataTransfer.files
        })
      })
  },
)
