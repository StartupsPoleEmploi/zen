import React from 'react'
import styled from 'styled-components'

import LinkButton from '../../components/Generic/LinkButton'

const StyledDiv = styled.div`
  text-align: center;
`

export const LoggedOut = () => (
  <StyledDiv>
    <p>Vous avez été déconnecté</p>
    <LinkButton to="/">Retour à la page d'accueil</LinkButton>
  </StyledDiv>
)

export default LoggedOut
