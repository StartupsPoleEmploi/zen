import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'

import { primaryBlue } from '../../constants'

const sectionColor = '#1e2c59'

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const Dot = styled.span`
  color: ${primaryBlue};
  font-family: serif;
  font-size: 3.5rem;
  font-weight: bold;
  margin-right: 1rem;
`

const Section = styled.div`
  text-transform: uppercase;
  display: flex;
`

const UlEmployers = styled.ul`
  margin: 0;
  list-style: none;
  padding-left: 2rem;
`

const DeclarationFinished = ({ declaration }) => {
  const salary = declaration.employers.reduce(
    (prev, emp) => prev + emp.salary,
    0,
  )
  return (
    <Section>
      <StyledDoneIcon />
      <div>
        <Typography className="declaration-status">
          <strong>Actualisation envoyée</strong>
        </Typography>

        <div>
          <Typography
            component="h3"
            style={{ lineHeight: 1, color: sectionColor }}
          >
            <Dot>.</Dot>
            Mes employeurs
          </Typography>
          <Typography>
            <UlEmployers>
              {declaration.employers.map((emp) => (
                <li key={emp.id}>
                  <strong>{emp.employerName}</strong>
                </li>
              ))}
            </UlEmployers>
          </Typography>
        </div>
        <div>
          <Typography
            component="h3"
            style={{ lineHeight: 1, color: sectionColor }}
          >
            <Dot>.</Dot>
            Salaire brut déclaré
            <br />
          </Typography>
          <Typography style={{ marginLeft: '2rem' }}>
            <strong>{salary} €</strong>
          </Typography>
        </div>
      </div>
    </Section>
  )
}

DeclarationFinished.propTypes = {
  declaration: PropTypes.object.isRequired,
}

export default DeclarationFinished
