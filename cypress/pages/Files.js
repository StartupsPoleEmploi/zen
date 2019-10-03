export const uploadNewEmployerFile = ({
  file = 'pdf-1-page.pdf',
  index = 0,
}) => {
  cy.uploadFile(file, 'application/pdf', '.employer-row', index)
  // consider upload as finished when a page is shown
  // use longer timeout as showing pages can be resource extensive
  cy.get('.react-pdf__Page', { timeout: 10000 })
}
export const uploadNewDeclarationInfoFile = ({
  file = 'pdf-1-page.pdf',
  index = 0,
}) => {
  cy.uploadFile(file, 'application/pdf', '.info-row', index)
  // consider upload as finished when a page is shown
  // use longer timeout as showing pages can be resource extensive
  cy.get('.react-pdf__Page', { timeout: 10000 })
}

export const skipEmployerFile = ({ index }) => {
  cy.get('.employer-row')
    .eq(index)
    .find('.already-transmitted-button')
    .click()
  cy.get('button')
    .contains('Oui')
    .click()
}

export const skipDeclarationInfoFile = ({ index }) => {
  cy.get('.info-row')
    .eq(index)
    .find('.already-transmitted-button')
    .click()
  cy.get('button')
    .contains('Oui')
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

export const getGoToPrevPage = () => cy.get('div[role=dialog] .previous-page')
export const getGoToNextPage = () => cy.get('div[role=dialog] .next-page')
export const goToNextPage = () => getGoToNextPage().click()
export const goToPrevPage = () => getGoToPrevPage().click()

export const closeModal = () => {
  cy.get('div[role=dialog] button')
    .contains('Fermer')
    .click()
  cy.get('div[role=dialog]').should('not.exist')
}
export const validateModalContent = () => {}

export const clickSendToPoleEmploiModalButton = () => {
  cy.get('div[role=dialog] .validate-file').click()
  cy.get('.confirm-validate-file').click()
}
