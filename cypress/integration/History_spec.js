import {
  getDeclarationStatus,
  getDeclarationText,
  getDeclarationMissingFiles,
} from '../pages/History'

describe('History page', function() {
  beforeEach(() => {
    cy.request('POST', '/api/tests/db/reset-for-history')
    cy.visit('/history')
    cy.url().should('contain', '/history')
  })

  it('should display 3 declarations : 2 done on Zen & 1 not done on Zen', () => {
    // First declaration is done with 2 missing documents
    getDeclarationStatus('#declaration-history-1').should(
      'have.text',
      'Actualisation envoyée',
    )
    getDeclarationText('#declaration-history-1').should(
      'have.text',
      'Tous les justificatifs envoyés',
    )

    // Second was not done on Zen
    getDeclarationStatus('#declaration-history-2').should(
      'have.text',
      "Pas d'actualisation sur Zen",
    )
    getDeclarationText('#declaration-history-2').should(
      'have.text',
      'Aucune information sur Zen',
    )

    // Third is completely done
    getDeclarationStatus('#declaration-history-3').should(
      'have.text',
      'Actualisation envoyée',
    )
    getDeclarationText('#declaration-history-3').should(
      'have.text',
      '2 justificatifs manquants',
    )
  })

  it('should redirect to /files and specifically on old months tabs', () => {
    getDeclarationMissingFiles('#declaration-history-3').click({ force: true })
    cy.url().should('contain', '/files')
    cy.get('button[aria-selected=true]').should(
      'have.text',
      'Mois précédents 2',
    )
  })
})
