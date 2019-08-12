import {
  addNewPage,
  clickSendToPoleEmploi,
  closeModal,
  deletePage,
  getPaginationText,
  getSendToPoleEmploiButton,
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
    getSendToPoleEmploiButton().should('be.disabled')
    uploadNewFile({ employerIndex: 0 })
    closeModal()
    getSendToPoleEmploiButton().should('be.disabled')
    uploadNewFile({ employerIndex: 1 })
    closeModal()
    getSendToPoleEmploiButton().should('not.be.disabled')

    clickSendToPoleEmploi()

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

    it('should return to the upload view after removing the only page', () => {
      uploadNewFile({ file: 'pdf-1-page.pdf' })
      deletePage()

      cy.contains('Veuillez choisir les fichiers').should('exist')
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
  })
})
