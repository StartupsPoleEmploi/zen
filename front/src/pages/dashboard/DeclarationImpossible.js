import React from 'react'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

const StyledCloseIcon = styled(CloseIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: red;
  }
`

const Section = styled.div`
  text-transform: uppercase;
  display: flex;
`

const DeclarationImpossible = () => (
  <>
    <Section>
      <StyledCloseIcon />
      <div>
        <Typography className="declaration-status">
          <strong>Actualisation impossible</strong>
        </Typography>
      </div>
    </Section>
    <Typography style={{ marginTop: '2rem' }}>
      Un problème technique nous empêche actuellement de récupérer les
      informations de votre statut de demandeur d'emploi.
    </Typography>
    <Typography style={{ marginTop: '2rem' }}>
      Vous pouvez réessayer ultérieurement ou effectuer vos opérations sur{' '}
      <a href="https://www.pole-emploi.fr" style={{ whiteSpace: 'nowrap' }}>
        pole-emploi.fr
      </a>
      .
    </Typography>
  </>
)

export default DeclarationImpossible
