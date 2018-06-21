import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

const StyledLayout = styled.div`
  max-width: 128rem;
  margin: auto;
`

const Title = styled(Typography)`
  flex: 1;
`

const Main = styled.main`
  padding: 5rem 1rem 0 1rem;
`

const StyledButton = styled(Button)`
  && {
    color: #fff;
    margin-left: 1rem;
  }
`

export class Layout extends Component {
  static propTypes = {
    children: PropTypes.node,
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
    }),
  }

  logout = () => {
    // TODO do not redirect with window.location anymore when we
    // have a global store.
    // (This is done so everything is reloaded)
    superagent.delete('/api/user').then(() => {
      window.location = '/loggedOut'
    })
  }

  render() {
    const { children, user } = this.props

    return (
      <StyledLayout>
        <AppBar position="static">
          <Toolbar>
            <Title color="inherit" variant="title">
              La Bonne Actualisation
            </Title>
            {user && (
              <Fragment>
                <Typography color="inherit" variant="subheading">
                  {user.firstName} {user.lastName}
                </Typography>
                <StyledButton onClick={this.logout} variant="outlined">
                  Déconnexion
                </StyledButton>
              </Fragment>
            )}
          </Toolbar>
        </AppBar>
        <Main>{children}</Main>
      </StyledLayout>
    )
  }
}

export default withRouter(Layout)
