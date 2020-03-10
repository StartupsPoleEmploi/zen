import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'

import { H1, H2 } from '../../components/Generic/Titles'
import DeclarationHistory from './DeclarationHistory'
import EmptyDeclaration from './EmptyDeclaration'

import { fetchDeclarations as fetchDeclarationAction } from '../../redux/actions/declarations'
import { fetchDeclarationMonths as fetchDeclarationMonthsAction } from '../../redux/actions/declarationMonths'
import {
  darkBlue,
  mobileBreakpoint,
  intermediaryBreakpoint,
} from '../../constants'
import { formattedDeclarationMonth } from '../../lib/date'

const StyledHistory = styled.div`
  max-width: 90rem;
  margin: 5rem auto 0 auto;
  @media (max-width: 1200px) {
    margin: 5rem 2rem 0 2rem;
  }
  @media (max-width: ${mobileBreakpoint}) {
    margin: 1rem 2rem 0 2rem;
  }
`

const MonthContainer = styled.div`
  border-bottom: solid 1px #ddd;
  padding: 3.5rem 0 2rem 0;
`
const StyledH1 = styled(H1)`
  && {
    font-size: 2rem;
    margin-bottom: 4rem;

    @media (max-width: ${intermediaryBreakpoint}) {
      margin-bottom: 1rem;
    }
    @media (max-width: ${mobileBreakpoint}) {
      margin-bottom: 0;
    }
  }
`

const StyledH2 = styled(H2)`
  && {
    font-size: 2.5rem;
    color: ${darkBlue};
    text-transform: capitalize;
    font-weight: normal;
    margin-bottom: 2rem;
  }
`

function History({
  isDeclarationsLoading,
  isDeclarationMonthsLoading,
  activeMonth,
  declarationMonths,
  declarations,
  fetchDeclarations,
  fetchDeclarationMonths,
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDeclarations()
    fetchDeclarationMonths()
  }, [])

  useEffect(() => {
    setIsLoading(isDeclarationsLoading || isDeclarationMonthsLoading)
  }, [isDeclarationsLoading, isDeclarationMonthsLoading])

  if (isLoading || !declarationMonths) {
    return (
      <StyledHistory>
        <CircularProgress />
      </StyledHistory>
    )
  }

  // Remove unfinished declaration
  if (declarations.length) {
    // eslint-disable-next-line no-param-reassign
    declarations = declarations.filter((d) => d.hasFinishedDeclaringEmployers)
  }
  // Remove active declaration
  if (activeMonth && declarations.length) {
    // eslint-disable-next-line no-param-reassign
    declarations = declarations.filter(
      (d) => d.declarationMonth.id !== activeMonth.id,
    )
  }

  if (declarations.length === 0) {
    return (
      <StyledHistory>
        <StyledH1>L'historique de votre actualisation sur Zen</StyledH1>
        <Typography>Pas d'historique pour le moment</Typography>
      </StyledHistory>
    )
  }

  // Fill the gaps
  const filledDeclarations = []
  let lastDeclarationMonthId = declarations[0].declarationMonth.id

  // Gap at the beginning
  const lastMonthId = declarationMonths[0].id
  for (let i = lastMonthId; i > lastDeclarationMonthId; i--) {
    filledDeclarations.push({
      declarationMonth: declarationMonths.find((dm) => dm.id === i),
    })
  }

  declarations.forEach((declaration) => {
    const currentMonth = declaration.declarationMonth.id
    if (
      currentMonth === lastDeclarationMonthId &&
      declaration.hasFinishedDeclaringEmployers
    ) {
      filledDeclarations.push(declaration)
    } else {
      // We find a empty month, we add empty declaration until we get to the current declaration
      for (let i = lastDeclarationMonthId; i !== currentMonth; i--) {
        filledDeclarations.push({
          declarationMonth: declarationMonths.find((dm) => dm.id === i),
        })
        lastDeclarationMonthId--
      }
      filledDeclarations.push(declaration)
    }

    lastDeclarationMonthId--
  })

  return (
    <StyledHistory>
      <StyledH1>L'historique de votre actualisation sur Zen</StyledH1>

      {filledDeclarations.map((d, index) => (
        <MonthContainer
          id={`declaration-history-${index}`}
          key={d.declarationMonth.month}
        >
          <StyledH2>
            {formattedDeclarationMonth(d.declarationMonth.month)}
          </StyledH2>

          {d.id ? (
            <DeclarationHistory lastMonthId={lastMonthId} declaration={d} />
          ) : (
            <EmptyDeclaration month={d.declarationMonth} />
          )}
        </MonthContainer>
      ))}
    </StyledHistory>
  )
}

History.propTypes = {
  activeMonth: PropTypes.instanceOf(Date).isRequired,

  declarations: PropTypes.arrayOf(PropTypes.object),
  fetchDeclarations: PropTypes.func.isRequired,
  isDeclarationsLoading: PropTypes.bool,

  declarationMonths: PropTypes.arrayOf(PropTypes.object),
  fetchDeclarationMonths: PropTypes.func.isRequired,
  isDeclarationMonthsLoading: PropTypes.bool,
}

export default connect(
  (state) => ({
    activeMonth: state.activeMonthReducer.activeMonth,

    declarations: state.declarationsReducer.declarations,
    isDeclarationsLoading: state.declarationsReducer.isLoading,

    declarationMonths: state.declarationMonthsReducer.declarationMonths,
    isDeclarationMonthsLoading: state.declarationMonthsReducer.isLoading,
  }),
  {
    fetchDeclarations: fetchDeclarationAction,
    fetchDeclarationMonths: fetchDeclarationMonthsAction,
  },
)(History)
