import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'
import DoneIcon from '@material-ui/icons/Done'
import { Typography } from '@material-ui/core'

import DeclarationFinished from './DeclarationFinished'
import DeclarationNotStarted from './DeclarationNotStarted'
import DeclarationClosed from './DeclarationClosed'
import DeclarationOnGoing from './DeclarationOnGoing'
import DeclarationImpossible from './DeclarationImpossible'
import { intermediaryBreakpoint } from '../../../constants'

const StyledActuStatus = styled.div`
  width: 100%;
  padding: 3rem 2rem 3rem 0;

  @media (max-width: ${intermediaryBreakpoint}) {
    margin: auto;
    padding: 3rem 2rem;
    width: 100%;
  }
`

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const SubTitle = styled(Typography).attrs({ variant: 'h5', component: 'h2' })`
  && {
    display: inline-block;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: solid 1px lightgray;
    font-size: 2rem;
    font-weight: bold;
    position: relative;

    @media (max-width: ${intermediaryBreakpoint}) {
      width: 100%;
    }
  }
`

const Upper = styled.span`
  text-transform: uppercase;
`

function ActuStatus({
  activeMonth,
  user,
  showTitle = true,
  declarations: allDeclarations,
  declaration: activeDeclaration,
}) {
  const activeMonthMoment = activeMonth ? moment(activeMonth) : null

  function renderActuStatus() {
    if (!activeMonth) {
      return <DeclarationClosed previousDeclaration={allDeclarations[0]} />
    }

    if (user.hasAlreadySentDeclaration) {
      return (
        <div>
          <Typography
            style={{ textTransform: 'uppercase', margin: '2rem 0 1.5rem 0' }}
          >
            <strong>
              <StyledDoneIcon /> Actualisation déjà envoyée via pole-emploi.fr
            </strong>
          </Typography>
        </div>
      )
    }

    if (activeMonth && !activeDeclaration && user.canSendDeclaration) {
      return <DeclarationNotStarted activeMonth={activeMonth} />
    }

    if (!user.canSendDeclaration) {
      return <DeclarationImpossible />
    }

    if (activeDeclaration.hasFinishedDeclaringEmployers) {
      return <DeclarationFinished declaration={activeDeclaration} />
    }

    if (activeDeclaration) {
      return (
        <DeclarationOnGoing
          declaration={activeDeclaration}
          activeMonth={activeMonth}
        />
      )
    }
  }

  return (
    <StyledActuStatus>
      {showTitle && (
        <SubTitle>
          Actualisation
          {activeMonthMoment && ' - '}
          {activeMonthMoment && (
            <Upper>{activeMonthMoment.format('MMMM YYYY')}</Upper>
          )}
        </SubTitle>
      )}
      {renderActuStatus(user, allDeclarations, activeDeclaration, activeMonth)}
    </StyledActuStatus>
  )
}

ActuStatus.propTypes = {
  activeMonth: PropTypes.instanceOf(Date).isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    hasAlreadySentDeclaration: PropTypes.bool,
    canSendDeclaration: PropTypes.bool,
    isBlocked: PropTypes.bool,
    email: PropTypes.string,
    needOnBoarding: PropTypes.bool,
    registeredAt: PropTypes.instanceOf(Date),
  }),
  declaration: PropTypes.object,
  showTitle: PropTypes.bool,
  declarations: PropTypes.arrayOf(PropTypes.object),
}

export default ActuStatus
