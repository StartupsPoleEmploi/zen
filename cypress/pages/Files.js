export const uploadNewFile = ({
  file = 'pdf-1-page.pdf',
  employerIndex = 0,
}) => {
  cy.uploadFile(file, 'application/pdf', '.employer-row', employerIndex)
  // consider upload as finished when a page is shown
  // use longer timeout as showing pages can be resource extensive
  cy.get('.react-pdf__Page', { timeout: 10000 })
}
export const replaceCurrentFile = ({
  file = 'pdf-1-page.pdf',
  employerIndex,
}) => {
  cy.uploadFile(file, 'application/pdf', '.employer-row', employerIndex)
}

export const showFileInModal = ({ employerIndex }) => {
  cy.get('.employer-row')
    .eq(employerIndex)
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
    .contains('Fermer la prévisualisation')
    .click()
  cy.get('div[role=dialog]').should('not.exist')
}
export const validateModalContent = () => {}

export const getSendToPoleEmploiButton = () => cy.get('.send-to-pe')
export const clickSendToPoleEmploi = () => getSendToPoleEmploiButton().click()
