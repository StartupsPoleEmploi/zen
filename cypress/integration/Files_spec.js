import {
  uploadNewFile,
  showFileInModal,
  deletePage,
  goToNextPage,
  goToPrevPage,
  getPaginationText,
  getSendToPoleEmploiButton,
  clickSendToPoleEmploi,
  addNewPage,
} from '../pages/Files'

describe('Files page', function() {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('POST', '/api/tests/db/reset-for-files')
  })

  describe('PDF viewers test => ', () => {
    beforeEach(() => {
      cy.visit('/files')
      cy.get('h1').should('contain', 'Justificatifs de')
    })

    it('should upload PDF file', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'pdf-1-page.pdf' })

      cy.get('.employer-row')
        .eq(employerIndex)
        .find('button.show-file')
        .should('be', 'Voir le document fourni')
    })

    it('should upload JPG file', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'water.jpg' })

      cy.get('.employer-row')
        .eq(employerIndex)
        .find('button.show-file')
        .should('be', 'Voir le document fourni')
    })

    it('should upload PNG file', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'logo-zen-pe.png' })

      cy.get('.employer-row')
        .eq(employerIndex)
        .find('button.show-file')
        .should('be', 'Voir le document fourni')
    })

    it('should upload PNG, JPG and PDF files and merge them', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'logo-zen-pe.png' })
      showFileInModal({ employerIndex })
      addNewPage({ file: 'water.jpg' })
      getPaginationText().should('contain', '2/2')
      addNewPage({ file: 'pdf-1-page.pdf' })
      getPaginationText().should('contain', '3/3')
    })

    it('should not allow the user to upload any more pages than the maximum', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex, file: 'logo-zen-pe.png' })
      showFileInModal({ employerIndex })
      addNewPage({ file: 'pdf-14-pages.pdf' })

      cy.contains('Erreur : Fichier trop lourd').should('exist')
    })

    it('should open modal', () => {
      const employerIndex = 0
      uploadNewFile({ employerIndex })
      showFileInModal({ employerIndex })
    })

    it('should not allowed additionnal pages', () => {
      const employerIndex = 0
      uploadNewFile({ file: 'pdf-14-pages.pdf', employerIndex })
      showFileInModal({ employerIndex })
      getPaginationText().should('contain', '14/14')
      cy.get('div[role=dialog] .add-page').should('not.exist')
    })

    it('should return to the upload view after removing the only page', () => {
      const employerIndex = 0
      uploadNewFile({ file: 'pdf-1-page.pdf', employerIndex })
      showFileInModal({ employerIndex })
      deletePage()

      cy.contains('Veuillez choisir les fichiers').should('exist')
    })

    it('should allow navigation in the modal', () => {
      const employerIndex = 0
      uploadNewFile({ file: 'pdf-14-pages.pdf', employerIndex })
      showFileInModal({ employerIndex })

      getPaginationText().should('contain', '14/14')
      goToPrevPage()
      getPaginationText().should('contain', '13/14')

      goToPrevPage()
      getPaginationText().should('contain', '12/14')

      goToNextPage()
      getPaginationText().should('contain', '13/14')
    })

    it('should allow removing pages', () => {
      const employerIndex = 0
      uploadNewFile({ file: 'pdf-14-pages.pdf', employerIndex })
      showFileInModal({ employerIndex })

      getPaginationText().should('contain', '14/14')
      deletePage()
      getPaginationText().should('contain', '13/13')
    })

    it('should allow send to Pole Emploi', () => {
      getSendToPoleEmploiButton().should('be.disabled')
      uploadNewFile({ employerIndex: 0 })
      uploadNewFile({ employerIndex: 1 })
      getSendToPoleEmploiButton().should('not.be.disabled')
    })

    it('should display confirmation message after sending', () => {
      uploadNewFile({ employerIndex: 0 })
      uploadNewFile({ employerIndex: 1 })
      clickSendToPoleEmploi()

      cy.get('h1').should(
        'contain',
        'Merci, vos justificatifs ont été bien transmis',
      )
    })
  })
})
