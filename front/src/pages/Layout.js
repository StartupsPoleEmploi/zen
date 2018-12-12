import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Person from '@material-ui/icons/PersonOutline'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'

import AppTitle from '../components/Generic/AppTitle'

const styles = (theme) => ({
  lightTooltip: {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
})

const StyledLayout = styled.div`
  max-width: 128rem;
  margin: auto;
`

const Header = styled.header`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  padding-left: 1.5rem;
`

const PersonIcon = styled(Person)`
  && {
    margin-right: 1rem;
    font-size: 2rem;
  }
`

const Main = styled.main`
  padding: 5rem 1rem;
`

const UserContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`

export class Layout extends Component {
  static propTypes = {
    children: PropTypes.node,
    classes: PropTypes.object,
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      csrfToken: PropTypes.string,
    }),
    stepper: PropTypes.node,
  }

  state = { isTooltipOpened: false }

  setTooltipClosed = () => this.setState({ isTooltipOpened: false })
  toggleTooltip = () =>
    this.setState((state) => ({ isTooltipOpened: !state.isTooltipOpened }))

  render() {
    const { children, classes, user, stepper } = this.props

    return (
      <StyledLayout>
        <Header>
          <AppTitle style={{ flex: 1, textAlign: 'center' }} />

          {stepper}

          {user && (
            <UserContainer>
              <ClickAwayListener onClickAway={this.setTooltipClosed}>
                <Tooltip
                  classes={{ tooltip: classes.lightTooltip }}
                  disableHoverListener
                  disableFocusListener
                  disableTouchListener
                  open={this.state.isTooltipOpened}
                  placement="bottom"
                  title={
                    <Button
                      href="/api/login/logout"
                      target="_self"
                      disableRipple
                      variant="text"
                    >
                      Déconnexion
                    </Button>
                  }
                >
                  <Button onClick={this.toggleTooltip} disableRipple>
                    <PersonIcon />
                    <Typography color="inherit">{user.firstName}</Typography>
                    {this.state.isTooltipOpened ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </Button>
                </Tooltip>
              </ClickAwayListener>
            </UserContainer>
          )}
        </Header>
        <Main>{children}</Main>
      </StyledLayout>
    )
  }
}

export default withRouter(withStyles(styles)(Layout))
