import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { Link } from 'react-router-dom'
import superagent from 'superagent'
import moment from 'moment'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';

import MainActionButton from '../MainActionButton'
import catchMaintenance from '../../../lib/catchMaintenance'

const StyledPriorityIcon = styled(PriorityHighIcon)`
  && {
    margin-right: 1rem;
    display: inline-block;
    vertical-align: bottom;
    color: #ff6237;
  }
`

const Container = styled.div`
  display: flex;
  margin: 2rem 0 1.5rem 0;
`

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
  }
`
const ContainerBt = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
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

      <Container>
        <StyledPriorityIcon />
        <div>
          <Typography
            className="declaration-status"
            style={{ textTransform: 'uppercase', marginBottom: '1rem' }}
          >
            <strong>Actualisation non débutée</strong>
          </Typography>

          {actuEndDate && (
            <Typography>
              Vous avez jusqu'au <strong>{actuEndDate}</strong> pour vous
              actualiser.
            </Typography>
          )}
        </div>
      </Container>
      
      <div style={{ margin: "0rem -2rem", backgroundColor: "#fff", height: '0.5rem' }} />

      <MainActionButton
        to="/actu"
        component={Link}
        title="Je m'actualise"
        style={{
          width: '50%',
          margin: '2rem auto 0 3rem',
        }}
        primary
      >
        <ContainerBt>
          <div />
          <>Je m'actualise</>
          <StyledArrowForwardIcon />
        </ContainerBt>
      </MainActionButton>
    </div>
  )
}

export default DeclarationNotStarted
