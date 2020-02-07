export const DECLARATION_STATUS = {
  CLOSED: 'Pas encore ouverte',
  FINISHED: 'Actualisation envoyée',
  NOT_STARTED: 'Actualisation non débutée',
  ON_GOING: 'Actualisation en cours',
}

export function getDeclarationStatus() {
  return cy.get(`.declaration-status`)
}

export function getMissingInfoFiles() {
  return cy.get(`.missing-info-file`)
}
export function getMissingEmployerFiles() {
  return cy.get(`.missing-employer-file`)
}
export function getAllMissingFiles() {
  return cy.get(`.missing-info-file, .missing-employer-file`)
}

export function getCompletionJauge() {
  return cy.get(`.declaration-completion`)
}
