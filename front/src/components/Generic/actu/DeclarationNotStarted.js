import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { Link } from 'react-router-dom'
import superagent from 'superagent'
import moment from 'moment'

import MainActionButton from '../MainActionButton'
import catchMaintenance from '../../../lib/catchMaintenance'

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
  }
`

const DeclarationNotStarted = () => {
  const [actuEndDate, setActuEndDate] = useState(null)

  useEffect(() => {
    superagent
      .get('/api/declarationMonths/current-declaration-month')
      .then(({ body: { endDate } }) => {
        // Note: the endDate in database is the 16th (at midnight) of the month
        // So we need to the display the day before as last day for declaration
        setActuEndDate(
          moment(endDate)
            .subtract(1, 'day')
            .format('DD MMMM YYYY'),
        )
      })
      .catch(catchMaintenance)
  }, [])

  return (
    <div>
      <Typography
        className="declaration-status"
        style={{ textTransform: 'uppercase', margin: '2rem 0 1.5rem 0' }}
      >
        <strong>Actualisation non débutée</strong>
      </Typography>

      {actuEndDate && (
        <div>
          <Typography>
            Vous avez jusqu'au <strong>{actuEndDate}</strong> pour vous
            actualiser.
          </Typography>
        </div>
      )}

      <MainActionButton
        to="/actu"
        component={Link}
        title="Je m'actualise"
        style={{
          width: '90%',
          margin: '2rem auto 0 auto',
        }}
        primary
      >
        Je m'actualise
        <StyledArrowForwardIcon />
      </MainActionButton>
    </div>
  )
}

export default DeclarationNotStarted
