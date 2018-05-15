import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Typography } from '@material-ui/core'
import styled from 'styled-components'

const StyledHome = styled.div`
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

export class Home extends Component {
  static propTypes = {
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
    }),
  }

  render() {
    const { user } = this.props

    return (
      <StyledHome>
        <LandingText color="inherit" variant="headline">
          Il n'a jamais été aussi simple de faire son actualisation
        </LandingText>
        {!user ? (
          <Typography variant="title">Connectez-vous pour commencer</Typography>
        ) : (
          <Button variant="raised">Commencer ma première actualisation</Button>
        )}
      </StyledHome>
    )
  }
}

export default Home
