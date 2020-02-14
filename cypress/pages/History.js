export function getDeclarationStatus(id) {
  return cy.get(`${id} .status`)
}

export function getDeclarationText(id) {
  return cy.get(`${id} .text`)
}

export function getDeclarationMissingFiles(id) {
  return cy.get(`${id} .text a`)
}
