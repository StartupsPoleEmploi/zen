import Button from '@material-ui/core/Button'
import React from 'react'
import styled from 'styled-components'

const StyledDiv = styled.div`
  text-align: center;
`

export const LoggedOut = () => (
  <StyledDiv>
    <p>Vous avez été déconnecté</p>
    <Button href="/" role="link" variant="contained">
      Retour à la page d'accueil
    </Button>
  </StyledDiv>
)

export default LoggedOut
