const DECLARATION_STATUSES = {
  SAVED: 0,
  TECH_ERROR: 1,
  AUTH_ERROR: 2,
  CLOSED: 3,
  ALREADY_DONE: 4,
  INCOHERENT: 5,
  INVALID: 6,
  // This is the status when no declaration has been done and we GET the service
  IMPOSSIBLE_OR_UNNECESSARY: 7,
}

const DECLARATION_ALT_STATUSES = {
  // from the docs: only possible status with the declaration webservice we use are:
  // STATUS 0, ALT_STATUS 1,
  // STATUS 3, ALT_STATUS 4,
  // STATUS 4, ALT_STATUS 3
  // except that by testing we got at least once STATUS 4, ALT_STATUS 2.
  // So entering all statuses for future reference.
  OPEN: 0,
  MODIFICATION_POSSIBLE: 1,
  PROCESSING: 2,
  DONE: 3,
  CLOSED: 4,
  IMPOSSIBLE_OR_UNNECCESSARY: 5,
}

// documents context in which we send declaration files
const DECLARATION_CONTEXT_ID = '1'

const REALM = '/individu'

const DOCUMENT_LABELS = {
  sickLeave: 'Feuille maladie',
  internship: 'Attestation de stage',
  maternityLeave: 'Attestation de congé maternité',
  retirement: 'Attestation retraite',
  invalidity: 'Attestation invalidité',
  employerCertificate: 'Attestation employeur',
  salarySheet: 'Bulletin de salaire',
}


module.exports = {
  DECLARATION_STATUSES,
  DECLARATION_ALT_STATUSES,
  DECLARATION_CONTEXT_ID,
  REALM,
  DOCUMENT_LABELS
}
