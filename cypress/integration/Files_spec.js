import {
  addNewPage,
  closeModal,
  deletePage,
  getPaginationText,
  clickSendToPoleEmploiModalButton,
  goToNextPage,
  goToPrevPage,
  showFileInModal,
  uploadNewFile,
} from '../pages/Files'

describe('Files page', function() {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('POST', '/api/tests/db/reset-for-files')
    cy.visit('/files')
    cy.get('h1').should('contain', 'Justificatifs de')
  })

  it('should allow to send documents to Pole Emploi when they are all uploaded', () => {
    uploadNewFile({ employerIndex: 0 })
    clickSendToPoleEmploiModalButton()

    uploadNewFile({ employerIndex: 1 })
    clickSendToPoleEmploiModalButton()

    cy.url().should('contain', '/thanks')
    cy.get('h1').should(
      'contain',
      'Merci, vos justificatifs ont été bien transmis',
    )
  })

  describe('PDF viewer ', () => {
    it('should open the modal once a document is uploaded', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex })
      closeModal()
      showFileInModal({ employerIndex }) // check that the modal is re-openable
    })

    it('should display the original filename in modal - for PDF', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex })
      cy.get('p')
        .contains('pdf-1-page.pdf')
        .should('have.length', 1)
    })

    it('should display the original filename in modal - for JPG', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'water.jpg' })
      cy.get('p')
        .contains('water.jpg')
        .should('have.length', 1)
    })
    it('should display the original filename in modal- for PNG', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'logo-zen-pe.png' })
      cy.get('p')
        .contains('logo-zen-pe.png')
        .should('have.length', 1)
    })

    it('should upload PDF file', () => {
      uploadNewFile({ file: 'pdf-1-page.pdf' })
      closeModal()
    })

    it('should upload JPG file', () => {
      uploadNewFile({ file: 'water.jpg' })
      closeModal()
    })

    it('should upload PNG file', () => {
      uploadNewFile({ file: 'logo-zen-pe.png' })
      closeModal()
    })

    it('should upload PNG, JPG and PDF files and merge them', () => {
      uploadNewFile({ file: 'logo-zen-pe.png' })
      addNewPage({ file: 'water.jpg' })
      getPaginationText().should('contain', '2/2')
      addNewPage({ file: 'pdf-1-page.pdf' })
      getPaginationText().should('contain', '3/3')
    })

    it('should not allow the user to upload any more pages than the maximum', () => {
      uploadNewFile({ file: 'logo-zen-pe.png' })
      addNewPage({ file: 'pdf-14-pages.pdf' })

      cy.contains('Erreur : Fichier trop lourd').should('exist')
    })

    it('should not allow adding pages to already big enough document', () => {
      uploadNewFile({ file: 'pdf-14-pages.pdf' })
      getPaginationText().should('contain', '14/14')
      cy.get('div[role=dialog] .add-page').should('be.disabled')
    })

    it('should close the modal if the only page was removed', () => {
      uploadNewFile({ file: 'pdf-1-page.pdf' })
      deletePage()

      cy.get('div[role=dialog]').should('not.exist')
    })

    it('should allow navigation through document pages', () => {
      uploadNewFile({ file: 'pdf-14-pages.pdf' })
      getPaginationText().should('contain', '14/14')
      goToPrevPage()
      getPaginationText().should('contain', '13/14')
      goToPrevPage()
      getPaginationText().should('contain', '12/14')
      goToNextPage()
      getPaginationText().should('contain', '13/14')
    })

    it('should allow removing pages', () => {
      uploadNewFile({ file: 'pdf-14-pages.pdf' })
      getPaginationText().should('contain', '14/14')
      deletePage()
      getPaginationText().should('contain', '13/13')
    })

    it('should keep the filename after uploading new files', () => {
      uploadNewFile({ file: 'logo-zen-pe.png' })
      cy.get('.filename').should('contain', 'logo-zen-pe.png')
      addNewPage({ file: 'water.jpg' })
      cy.get('.filename').should('contain', 'logo-zen-pe.png')
      addNewPage({ file: 'pdf-1-page.pdf' })
      cy.get('.filename').should('contain', 'logo-zen-pe.png')
    })
  })
})
