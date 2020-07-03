import {
  getDeclarationStatus,
  getDeclarationText,
  getDeclarationMissingFiles,
} from '../pages/History';

describe('History page', () => {
  beforeEach(() => {
    cy.request('POST', '/api/tests/db/reset-for-history');
    cy.visit('/history');
    cy.url().should('contain', '/history');
  });

  it('should display 3 declarations : 2 done on Zen & 1 not done on Zen', () => {
    // First declaration is done with 2 missing documents
    getDeclarationStatus('#declaration-history-1').contains(
      'ACTUALISATION ENVOYÉE',
    );

    // Second was not done on Zen
    getDeclarationStatus('#declaration-history-2').contains(
      "Pas d'actualisation sur Zen",
    );
    getDeclarationText('#declaration-history-2').contains(
      'Aucune information sur Zen',
    );

    // Third is completely done
    getDeclarationStatus('#declaration-history-3').contains(
      'ACTUALISATION ENVOYÉE',
    );
    getDeclarationText('#declaration-history-3').contains(
      '2 justificatifs manquants',
    );
  });

  it('should redirect to /files', () => {
    getDeclarationMissingFiles('#declaration-history-3').click({ force: true });
    cy.url().should('contain', '/files');
  });
});
