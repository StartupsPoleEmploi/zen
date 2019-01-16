/* eslint-disable jsx-a11y/label-has-for, no-alert */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import superagent from 'superagent'
import { useDebounce } from 'use-debounce'

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

/*
 * Note : This component makes too much requests and should not be used as a model
 * (the declaration sent as props is never updated, which is a bad design,
 * but quick and ok for this admin's temporary interface)
 */

const DeclarationsTableDetailRow = ({ row: declaration }) => {
  const [isVerified, setIsVerified] = useState(
    declaration.metadata.isVerified || false,
  )
  const [notes, setNotes] = useState(declaration.metadata.notes || '')
  const [isComponentModified, setIsComponentModified] = useState(false)
  const debouncedIsVerified = useDebounce(isVerified, 1500)
  const debouncedNotes = useDebounce(notes, 1500)

  useEffect(
    () => {
      if (!isComponentModified) return

      superagent
        .post(`/zen-admin-api/declarations/metadata`, {
          isVerified: debouncedIsVerified,
          id: declaration.id,
        })
        .then(() => {})
        .catch(() =>
          alert(
            `Une erreur s'est produite en mettant à jour les données, merci d'actualiser (si ceci se reproduit, contacter le développeur)`,
          ),
        )
    },
    [debouncedIsVerified],
  )

  useEffect(
    () => {
      if (!isComponentModified) return

      superagent
        .post(`/zen-admin-api/declarations/metadata`, {
          notes: debouncedNotes,
          id: declaration.id,
        })
        .then(() => {})
        .catch(() =>
          alert(
            `Une erreur s'est produite en mettant à jour les données, merci d'actualiser (si ceci se reproduit, contacter le développeur)`,
          ),
        )
    },
    [debouncedNotes],
  )

  return (
    <div>
      <h3>
        {declaration.user.firstName} {declaration.user.lastName}
      </h3>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isVerified}
            onChange={() => {
              setIsComponentModified(true)
              setIsVerified(!isVerified)
            }}
          />{' '}
          Vérifié
        </label>
        <br />
        <label>
          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(e) => {
              setIsComponentModified(true)
              setNotes(e.target.value)
            }}
          />{' '}
          Notes
        </label>
      </div>
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
            <li key={employer.id}>
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
