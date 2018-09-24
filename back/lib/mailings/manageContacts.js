const mailjet = require('./mailjet')

module.exports = {
  setDeclarationDoneProperty: (declaration) =>
    mailjet.manageContact({
      email: declaration.user.email,
      properties: {
        declaration_effectuee_mois: mailjet.formatDateForSegmentFilter(
          new Date(declaration.declarationMonth.month),
        ),
      },
    }),
  setDocumentsDoneProperty: (declaration) =>
    mailjet.manageContact({
      email: declaration.user.email,
      properties: {
        document_envoye_mois: mailjet.formatDateForSegmentFilter(
          new Date(declaration.declarationMonth.month),
        ),
      },
    }),
}
