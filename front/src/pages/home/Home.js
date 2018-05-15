import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Typography } from '@material-ui/core'
import styled from 'styled-components'

import PEConnectLink from '../../components/PEConnect/PEConnectLink'

const HomeContainer = styled.div`
  text-align: center;
  width: 50rem;
  margin: 5rem auto;
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
      <HomeContainer>
        <header>
          <Typography variant="title">Actualisation Proto</Typography>
          {user ? (
            <Typography variant="subheading">
              {user.firstName} {user.lastName}
            </Typography>
          ) : (
            <PEConnectLink />
          )}
        </header>
        <main>
          <Typography variant="headline">
            Il n'a jamais été aussi simple de faire son actualisation
          </Typography>
          {!user ? (
            <Typography variant="body2">
              Connectez-vous pour commencer
            </Typography>
          ) : (
            <Button variant="raised">Commencer</Button>
          )}
        </main>
      </HomeContainer>
    )
  }
}

export default Home
