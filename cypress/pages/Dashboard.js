export const DECLARATION_STATUS = {
  CLOSED: 'Pas encore ouverte',
  FINISHED: 'Actualisation envoyée',
  NOT_STARTED: 'Actualisation non débutée',
  ON_GOING: 'Actualisation en cours',
}

export function getDeclarationStatus() {
  cy.get(`.declaration-status`)
}

export function getMissingInfoFiles() {
  cy.get(`.missing-info-file`)
}
export function getMissingEmployerFiles() {
  cy.get(`.missing-employer-file`)
}
export function getAllMissingFiles() {
  cy.get(`.missing-info-file, .missing-employer-file`)
}

export function getCompletionJauge() {
  cy.get(`.declaration-completion`)
}
