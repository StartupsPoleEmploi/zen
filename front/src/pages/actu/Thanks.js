import Typography from '@material-ui/core/Typography'
import React, { Component } from 'react'
import styled from 'styled-components'

const StyledThanks = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 30rem;
`

const LandingText = styled(Typography)`
  padding: 5rem 0;
`

export class Thanks extends Component {
  render() {
    return (
      <StyledThanks>
        <LandingText variant="headline">Merci !</LandingText>
        <LandingText variant="title">Vous avez terminé !</LandingText>
      </StyledThanks>
    )
  }
}

export default Thanks
