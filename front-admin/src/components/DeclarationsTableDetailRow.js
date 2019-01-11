import React from 'react'
import PropTypes from 'prop-types'
import { format } from 'date-fns'

const calculateTotal = (employers, field) =>
  Math.round(
    employers.reduce((prev, employer) => parseFloat(employer[field]) + prev, 0),
  )

const statuses = {
  hasTrained: {
    label: 'a été en formation',
    dateFields: [],
  },
  hasInternship: {
    label: 'a été en stage',
    dateFields: ['internshipStartDate', 'internshipEndDate'],
  },
  hasSickLeave: {
    label: 'a été en congé maladie',
    dateFields: ['sickLeaveStartDate', 'sickLeaveEndDate'],
  },
  hasMaternityLeave: {
    label: 'a été en congé maternité',
    dateFields: ['maternityLeaveStartDate'],
  },
  hasRetirement: {
    label: 'est en retraite',
    dateFields: ['retirementStartDate'],
  },
  hasInvalidity: { label: 'est invalide', dateFields: ['invalidityStartDate'] },
}

function DeclarationsTableDetailRow({ row: declaration }) {
  return (
    <div>
      <h3>
        {declaration.user.firstName} {declaration.user.lastName}
      </h3>
      <p>
        {Object.keys(statuses)
          .filter((key) => declaration[key])
          .map(
            (key) =>
              `${statuses[key].label} (${statuses[key].dateFields
                .map((field) => format(declaration[field], 'DD/MM'))
                .join(' - ')})`,
          )
          .join(', ')}
      </p>
      <p>
        Souhaite rester inscrit à Pôle Emploi:{' '}
        {declaration.isLookingForJob ? 'Oui' : 'Non'}
      </p>
      <p>Employeurs:</p>
      <ul>
        <React.Fragment>
          {declaration.employers.map((employer) => (
            <li>
              {employer.employerName} {employer.workHours}h {employer.salary}€ -
              Contrat {employer.hasEndedThisMonth ? 'terminé' : ' non terminé'}
            </li>
          ))}
        </React.Fragment>
      </ul>
      <p>
        Total: {calculateTotal(declaration.employers, 'workHours')}h,{' '}
        {calculateTotal(declaration.employers, 'salary')}€
      </p>
      <p>
        <a href={`/zen-admin-api/declarations/${declaration.id}/files`}>
          Télécharger les fichiers ({declaration.isFinished
            ? 'validées'
            : 'non validés'})
        </a>
      </p>
    </div>
  )
}

DeclarationsTableDetailRow.propTypes = {
  row: PropTypes.shape({
    user: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string,
    }),
    hasFinishedDeclaringEmployers: PropTypes.bool.isRequired,
    isFinished: PropTypes.bool.isRequired,
    employers: PropTypes.array,
  }),
}

export default DeclarationsTableDetailRow
