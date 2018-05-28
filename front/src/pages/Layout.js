import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

const StyledLayout = styled.div`
  max-width: 80rem;
  margin: auto;
`

const Title = styled(Typography)`
  flex: 1;
`

const Main = styled.main`
  padding: 5rem 1rem 0 1rem;
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
              <Typography color="inherit" variant="subheading">
                {user.firstName} {user.lastName}
              </Typography>
            )}
          </Toolbar>
        </AppBar>
        <Main>{children}</Main>
      </StyledLayout>
    )
  }
}

export default Layout
