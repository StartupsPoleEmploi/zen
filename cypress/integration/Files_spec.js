/* eslint-disable cypress/no-unnecessary-waiting */
import {
  addNewPage,
  closeModal,
  deletePage,
  getPaginationText,
  clickSendToPoleEmploiModalButton,
  goToNextPage,
  goToPrevPage,
  showEmployerFileInModal,
  showDeclarationInfoFileInModal,
  uploadNewEmployerFile,
  uploadNewDeclarationInfoFile,
  skipEmployerFile,
  skipDeclarationInfoFile,
  getDeclarationStatus,
  getCompletionJauge,
} from '../pages/Files'

import { DECLARATION_STATUS } from '../pages/Dashboard'

describe('Files page - Declaration not started', function() {
  beforeEach(() => {
    cy.request('POST', '/api/tests/db/reset')
    cy.viewport(1400, 1600)
    cy.visit('/files')
  })

  it('should display declaration not started', () => {
    getDeclarationStatus().should('have.text', DECLARATION_STATUS.NOT_STARTED)
  })
})
describe('Files page - Declaration started but employers not finished', function() {
  beforeEach(() => {
    cy.request('POST', '/api/tests/db/reset-for-employers')
    cy.viewport(1400, 1600)
    cy.visit('/files')
  })

  it('should display declaration on going', () => {
    getDeclarationStatus().should('have.text', DECLARATION_STATUS.ON_GOING)
  })
  it('should display 50% as declaration completion', () => {
    getCompletionJauge().should('have.text', '50%')
  })
})

describe('Files page', function() {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('POST', '/api/tests/db/reset-for-files')
    cy.viewport(1400, 1600)
    cy.visit('/files')
    cy.wait(500)
    cy.get('h1').should('contain', 'justificatifs à transmettre')
  })

  it('should allow to send documents to Pole Emploi when they are all uploaded', () => {
    uploadNewEmployerFile({ index: 0 })
    clickSendToPoleEmploiModalButton()

    uploadNewDeclarationInfoFile({ index: 0 })
    clickSendToPoleEmploiModalButton()

    uploadNewEmployerFile({ index: 0 })
    clickSendToPoleEmploiModalButton()

    cy.url().should('contain', '/thanks')
    cy.get('h1').should(
      'contain',
      'Merci, vos justificatifs ont été bien transmis',
    )
  })

  it('should allow to send documents to Pole Emploi when they are all skipped', () => {
    skipEmployerFile({ index: 0 })
    skipEmployerFile({ index: 0 })
    skipDeclarationInfoFile({ index: 0 })

    cy.url().should('contain', '/thanks')
    cy.get('h1').should(
      'contain',
      'Merci, vos justificatifs ont été bien transmis',
    )
  })

  describe('PDF viewer ', () => {
    ;[
      {
        label: 'Employer document',
        uploadFile: uploadNewEmployerFile,
        showFileInModal: showEmployerFileInModal,
      },
      {
        label: 'Declaration info document',
        uploadFile: uploadNewDeclarationInfoFile,
        showFileInModal: showDeclarationInfoFileInModal,
      },
      // eslint-disable-next-line array-callback-return
    ].map(({ label, uploadFile, showFileInModal }) => {
      describe(label, () => {
        it('should open the modal once a document is uploaded', () => {
          uploadFile({ file: 'pdf-1-page.pdf' })
          closeModal()
          showFileInModal({ index: 0 }) // check that the modal is re-openable
        })

        it('should display the original filename in modal - for PDF', () => {
          uploadFile({ file: 'pdf-1-page.pdf' })
          cy.get('p')
            .contains('pdf-1-page.pdf')
            .should('have.length', 1)
        })

        it('should display the original filename in modal - for JPG', () => {
          uploadFile({ file: 'water.jpg' })
          cy.get('p')
            .contains('water.jpg')
            .should('have.length', 1)
        })
        it('should display the original filename in modal- for PNG', () => {
          uploadFile({ file: 'logo-zen-pe.png' })
          cy.get('p')
            .contains('logo-zen-pe.png')
            .should('have.length', 1)
        })

        it('should upload PDF file', () => {
          uploadFile({ file: 'pdf-1-page.pdf' })
          closeModal()
        })

        it('should upload JPG file', () => {
          uploadFile({ file: 'water.jpg' })
          closeModal()
        })

        it('should upload PNG file', () => {
          uploadFile({ file: 'logo-zen-pe.png' })
          closeModal()
        })

        it('should upload PNG, JPG and PDF files and merge them', () => {
          uploadFile({ file: 'logo-zen-pe.png' })
          addNewPage({ file: 'water.jpg' })
          getPaginationText().should('contain', '2/2')
          addNewPage({ file: 'pdf-1-page.pdf' })
          getPaginationText().should('contain', '3/3')
        })

        it('should not allow the user to upload any more pages than the maximum', () => {
          uploadFile({ file: 'logo-zen-pe.png' })
          addNewPage({ file: 'pdf-14-pages.pdf' })
          cy.contains('Erreur : Fichier trop lourd', { timeout: 30000 }).should(
            'exist',
          )
        })

        it('should not allow files with more than 5 pages', () => {
          uploadFile({ file: 'pdf-14-pages.pdf', willFail: true })
          cy.get('.upload-error').should('exist')
        })

        it('should not allow adding pages to already big enough document', () => {
          uploadFile({ file: 'pdf-4-pages.pdf' })
          addNewPage({ file: 'pdf-1-page.pdf' })
          getPaginationText().should('contain', '5/5')
          cy.get('div[role=dialog] .add-page[aria-disabled]') // check existence of label with aria-disabled
        })

        it('should close the modal if the only page was removed', () => {
          uploadFile({ file: 'pdf-1-page.pdf' })
          deletePage()

          cy.get('div[role=dialog]').should('not.exist')
        })

        it('should allow navigation through document pages', () => {
          uploadFile({ file: 'pdf-4-pages.pdf' })
          getPaginationText().should('contain', '4/4')
          goToPrevPage()
          getPaginationText().should('contain', '3/4')
          goToPrevPage()
          getPaginationText().should('contain', '2/4')
          goToNextPage()
          getPaginationText().should('contain', '3/4')
        })

        it('should allow removing pages', () => {
          uploadFile({ file: 'pdf-4-pages.pdf' })
          getPaginationText().should('contain', '4/4')
          deletePage()
          getPaginationText().should('contain', '3/3')
        })

        it('should keep the filename after uploading new files', () => {
          uploadFile({ file: 'logo-zen-pe.png' })
          cy.get('.filename').should('contain', 'logo-zen-pe.png')
          addNewPage({ file: 'water.jpg' })
          cy.get('.filename').should('contain', 'logo-zen-pe.png')
          addNewPage({ file: 'pdf-1-page.pdf' })
          cy.get('.filename').should('contain', 'logo-zen-pe.png')
        })
      })
    })
  })
})
