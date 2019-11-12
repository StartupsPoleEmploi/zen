export const DECLARATION_STATUS = {
  CLOSED: 'Pas encore ouverte',
  FINISHED: 'Actualisation envoyée',
  NOT_STARTED: 'Actualisation non débutée',
  ON_GOING: 'Actualisation en cours',
}

export const getDeclarationStatus = () => cy.get(`.declaration-status`)

export const getMissingInfoFiles = () => cy.get(`.missing-info-file`)
export const getMissingEmployerFiles = () => cy.get(`.missing-employer-file`)
export const getAllMissingFiles = () =>
  cy.get(`.missing-info-file, .missing-employer-file`)

export const getCompletionJauge = () => cy.get(`.declaration-completion`)
