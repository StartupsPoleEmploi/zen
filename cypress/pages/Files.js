/* eslint-disable cypress/no-unnecessary-waiting */
export const uploadNewEmployerFile = ({
  file = 'pdf-1-page.pdf',
  index = 0,
  willFail = false,
}) => {
  cy.uploadFile(file, 'application/pdf', '.employer-row', index)
  // consider upload as finished when a page is shown
  // use longer timeout as showing pages can be resource extensive
  if (!willFail) cy.get('.react-pdf__Page', { timeout: 30000 })
}
export const uploadNewDeclarationInfoFile = ({
  file = 'pdf-1-page.pdf',
  index = 0,
  willFail = false,
}) => {
  cy.uploadFile(file, 'application/pdf', '.info-row', index)
  // consider upload as finished when a page is shown
  // use longer timeout as showing pages can be resource extensive
  if (!willFail) cy.get('.react-pdf__Page', { timeout: 30000 })
}

export const skipEmployerFile = ({ index }) => {
  cy.get('.employer-row')
    .eq(index)
    .find('.already-transmitted-button')
    .click()
  cy.get('button')
    .contains('Je confirme')
    .click()
  cy.wait(500)
}

export const skipDeclarationInfoFile = ({ index }) => {
  cy.get('.info-row')
    .eq(index)
    .find('.already-transmitted-button')
    .click()
  cy.get('button')
    .contains('Je confirme')
    .click()
}

export const showEmployerFileInModal = ({ index }) => {
  cy.get('.employer-row')
    .eq(index)
    .find('.show-file')
    .click()
}

export const showDeclarationInfoFileInModal = ({ index }) => {
  cy.get('.info-row')
    .eq(index)
    .find('.show-file')
    .click()
}

export const addNewPage = ({ file }) => {
  cy.get('div[role=dialog] .add-page').click()
  cy.uploadFile(file, 'application/pdf', 'div[role=dialog] label')
}
export const deletePage = () => {
  cy.get('div[role=dialog] .delete-page').click()
  cy.get('button')
    .contains('Oui, je confirme')
    .click()
}

export const getPaginationText = () => cy.get('div[role=dialog] .pager')

export const getGoToPrevPage = () =>
  cy.get('div[role=dialog] .pager .previous-page')
export const getGoToNextPage = () =>
  cy.get('div[role=dialog] .pager .next-page')
export const goToNextPage = () => getGoToNextPage().click()
export const goToPrevPage = () => getGoToPrevPage().click()

export const closeModal = () => {
  cy.get('div[role=dialog] .bt-close').click()
  cy.get('div[role=dialog]').should('not.exist')
}
export const validateModalContent = () => {}

export const clickSendToPoleEmploiModalButton = () => {
  cy.get('div[role=dialog] .validate-file').click()
  cy.get('.confirm-validate-file').click()
}

export const getDeclarationStatus = () => cy.get(`.declaration-status`)
export const getCompletionJauge = () => cy.get(`.declaration-completion`)
