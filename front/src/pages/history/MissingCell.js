import React from 'react'
import { Typography, Link } from '@material-ui/core'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import DoneIcon from '@material-ui/icons/Done'

import { getDeclarationMissingFilesNb } from '../../lib/file'
import { intermediaryBreakpoint, mobileBreakpoint } from '../../constants'
import TooltipOnFocus from '../../components/Generic/TooltipOnFocus'

// prettier-ignore
const DOCUMENT_LABELS_FORMAT = {
  sickLeave: (n) => `${n} ${ n > 1 ? 'feuilles maladies envoyées' : 'feuille maladie envoyée'}`,
  internship: (n) => `${n} ${ n > 1 ? 'attestations de stage envoyées' : 'attestation de stage envoyée'}`,
  maternityLeave: (n) => `${n} ${ n > 1 ? 'attestations de congé maternité envoyées' : 'attestation de congé maternité envoyée'}`,
  retirement: (n) => `${n} ${ n > 1 ? 'attestations retraite envoyées' : 'attestation retraite envoyée'}`,
  invalidity: (n) => `${n} ${ n > 1 ? 'attestations invalidité envoyées' : 'attestation invalidité envoyée'}`,
  employerCertificate: (n) => `${n} ${ n > 1 ? 'attestations employeur envoyées' : 'attestation employeur envoyée'}`,
  salarySheet: (n) => `${n} ${ n > 1 ? 'bulletins de salaire envoyés' : 'bulletin de salaire envoyé'}`,
}

const StyledMissingCell = styled.div`
    flex: 1;

    display: flex;
    align-items: center;
    padding: 1rem;
    height: 100%;
    border-left: solid 1px #ddd;
    justify-content: center;
    text-align: center;

    @media (max-width: ${intermediaryBreakpoint}) {
      padding: 2rem;
      border-left: none;
      border-top: solid 1px #ddd;
    }

    @media (max-width: ${mobileBreakpoint}) {
      justify-content: left;
      border: none;
      padding-top: .5rem;
      padding-bottom: 2rem;
      padding-left: 0;
    }
  }
`

const Ul = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const MissingCell = ({ lastMonthId, width, declaration }) => {
  const missingFilesNumber = getDeclarationMissingFilesNb(declaration)

  function renderAllFilesSend(declarationContent) {
    const filesByType = {}

    declarationContent.infos.forEach(({ type }) => {
      if (filesByType[type] === undefined) filesByType[type] = 1
      else {
        filesByType[type]++
      }
    })

    declarationContent.employers.forEach((employer) => {
      employer.documents.forEach(({ type }) => {
        if (filesByType[type] === undefined) filesByType[type] = 1
        else {
          filesByType[type]++
        }
      })
    })

    const tooltipContent = (
      <Ul>
        {Object.entries(filesByType).map(([type, number]) => (
          <li key={type}>{DOCUMENT_LABELS_FORMAT[type](number)}</li>
        ))}
      </Ul>
    )

    return (
      <TooltipOnFocus content={tooltipContent}>
        <Typography style={{ paddingLeft: width === 'xs' ? '3.2rem ' : null }}>
          {width !== 'xs' && <StyledDoneIcon />}
          Tous les justificatifs envoyés
        </Typography>
      </TooltipOnFocus>
    )
  }

  return (
    <StyledMissingCell className="text">
      {missingFilesNumber === 0 ? (
        renderAllFilesSend(declaration)
      ) : (
        <Link
          href={`/files${
            lastMonthId === declaration.declarationMonth.id ? '' : '?tab=old'
          }`}
          style={{ paddingLeft: width === 'xs' ? '3.2rem' : null }}
        >
          <Typography>
            {missingFilesNumber}{' '}
            {missingFilesNumber === 1
              ? 'justificatif manquant'
              : 'justificatifs manquants'}
          </Typography>
        </Link>
      )}
    </StyledMissingCell>
  )
}

MissingCell.propTypes = {
  declaration: PropTypes.object,
  lastMonthId: PropTypes.number.isRequired,
  width: PropTypes.string.isRequired,
}

export default MissingCell
