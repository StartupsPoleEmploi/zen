import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import superagent from 'superagent'
import moment from 'moment'

import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { primaryBlue, darkBlue } from '../../../constants'
import catchMaintenance from '../../../lib/catchMaintenance'

const Container = styled.div`
  display: flex;
  margin: 2rem 0 1.5rem 0;
`

const StyledCloseIcon = styled(CloseOutlinedIcon)`
  && {
    margin-right: 1rem;
    display: inline-block;
    vertical-align: bottom;
    color: gray;
  }
`
const Dot = styled.span`
  color: ${primaryBlue};
  font-family: serif;
  font-size: 3.5rem;
  font-weight: bold;
  margin-right: 2.2rem;
`

const EmployerSection = styled.div`
  text-transform: uppercase;
`

const UlEmployers = styled.ul`
  margin: 0;
  list-style: none;
  padding-left: 3.2rem;
`

const DeclarationClosed = ({ previousDeclaration }) => {
  const [actuStartdDate, setActuStartdDate] = useState(null)

  const relevantPreviousEmployers = previousDeclaration
    ? previousDeclaration.employers.filter(
        (employer) => !employer.hasEndedThisMonth,
      )
    : []

  useEffect(() => {
    superagent
      .get('/api/declarationMonths/next-declaration-month')
      .then(({ body: { startDate } }) => {
        setActuStartdDate(moment(new Date(startDate)).format('DD MMMM YYYY'))
      })
      .catch(catchMaintenance)
  }, [])

  return (
    <div>
      <Container>
        <StyledCloseIcon />
        <div>
          <Typography
            className="declaration-status"
            style={{ textTransform: 'uppercase', marginBottom: '1rem' }}
          >
            <strong>Pas encore ouverte</strong>
          </Typography>

          {actuStartdDate && (
            <Typography>
              Vous pourrez vous actualiser à partir du{' '}
              <strong>{actuStartdDate}</strong>
            </Typography>
          )}
        </div>
      </Container>

      {previousDeclaration && relevantPreviousEmployers.length > 0 && (
        <EmployerSection>
          <Typography
            component="h3"
            style={{
              lineHeight: 1,
              color: darkBlue,
              marginBottom: '.5rem',
            }}
          >
            <Dot>.</Dot>
            Mes employeurs
          </Typography>
          <UlEmployers>
            {relevantPreviousEmployers.map((emp) => (
              <li key={emp.id}>
                <Typography>
                  <strong>{emp.employerName}</strong>
                </Typography>
              </li>
            ))}
          </UlEmployers>
        </EmployerSection>
      )}
    </div>
  )
}

DeclarationClosed.propTypes = {
  previousDeclaration: PropTypes.object.isRequired,
}

export default DeclarationClosed
