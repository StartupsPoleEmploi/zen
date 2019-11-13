import React from 'react'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const Section = styled.div`
  text-transform: uppercase;
  display: flex;
`

const DeclarationImpossible = () => (
  <Section>
    <StyledDoneIcon />
    <div>
      <Typography className="declaration-status">
        <strong>Actualisation envoyée</strong>
      </Typography>
    </div>
  </Section>
)

export default DeclarationImpossible
