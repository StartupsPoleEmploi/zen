import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Person from '@material-ui/icons/PersonOutline'

import AppTitle from '../Generic/AppTitle'
import ZnNavLogin from './ZnNavLogin'
import { primaryBlue, mobileBreakpoint } from '../../constants'
import dashboardBg from '../../images/dashboard-bg.svg'

const routesWithDisplayedNav = [
  '/actu',
  '/employers',
  '/files',
  '/dashboard',
  '/thanks',
  '/history',
  '/cgu',
]
const [, , , dashboardRoute] = routesWithDisplayedNav

const useStyles = makeStyles((theme) => ({
  lightTooltip: {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))

const StyledLayout = styled.div`
  margin: auto;
`

const Header = styled.header.attrs({ role: 'banner' })`
  display: flex;
  justify-content: flex-end;

  @media (max-width: ${mobileBreakpoint}) {
    justify-content: space-between;
  }
`

const UserButton = styled(Button)`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${primaryBlue};
    padding: 1.5rem 10rem;
    border-radius: 0;
    border-bottom-left-radius: 7rem 5rem;
    color: #fff;
    height: 5.5rem;
    margin-bottom: -5.5rem;

    &:hover {
      background-color: ${primaryBlue};
    }

    @media (max-width: ${mobileBreakpoint}) {
      margin-bottom: 0;
      padding: 1.5rem;
      padding-left: 6rem;
    }
  }
`

const PersonIcon = styled(Person)`
  && {
    margin-right: 1rem;
    font-size: 2rem;
  }
`

const Container = styled.div`
  display: flex;
  width: 100%;
`

const Main = styled.main.attrs({ role: 'main' })`
  padding: 7rem 1rem;
  flex-grow: 1;
  overflow: hidden;

  background: ${({ addBackground }) =>
    addBackground ? `url(${dashboardBg}) no-repeat 0 100%` : null};

  @media (max-height: 1000px) {
    background: none;
  }
  @media (max-width: 672px) {
    background: none;
  }

  @media (max-width: ${mobileBreakpoint}) {
    padding-top: 2rem;
  }
`

const AppTitleMobileContainer = styled.div`
  padding-left: 2rem;
  padding-top: 0.5rem;
`

export const Layout = ({
  activeMonth,
  activeDeclaration,
  isFilesServiceUp,
  children,
  user,
  location: { pathname },
  history: { push },
}) => {
  const classes = useStyles()
  const [isTooltipOpened, setTooltipOpened] = useState(false)
  const toggleTooltip = () => setTooltipOpened(!isTooltipOpened)

  const isNavVisible = routesWithDisplayedNav.includes(pathname)

  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`)

  const NavComponent = () => (
    <ZnNavLogin
      user={user}
      isFilesServiceUp={isFilesServiceUp}
      history={{ push }}
      location={{ pathname }}
      activeMonth={activeMonth}
      activeDeclaration={activeDeclaration}
    />
  )

  return (
    <StyledLayout>
      <Header>
        {useMobileVersion && (
          <AppTitleMobileContainer>
            <AppTitle />
          </AppTitleMobileContainer>
        )}
        {user && (
          <ClickAwayListener onClickAway={() => setTooltipOpened(false)}>
            <Tooltip
              classes={{ tooltip: classes.lightTooltip }}
              disableHoverListener
              disableFocusListener
              disableTouchListener
              open={isTooltipOpened}
              placement="bottom"
              title={
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Button
                    href="/cgu"
                    target="_self"
                    disableRipple
                    variant="text"
                  >
                    CGU
                  </Button>

                  <Button
                    href="/api/login/logout"
                    target="_self"
                    disableRipple
                    variant="text"
                  >
                    Déconnexion
                  </Button>
                </div>
              }
            >
              <UserButton onClick={toggleTooltip} disableRipple>
                <PersonIcon />
                {user.firstName}
                {isTooltipOpened ? <ExpandLess /> : <ExpandMore />}
              </UserButton>
            </Tooltip>
          </ClickAwayListener>
        )}
      </Header>

      {useMobileVersion && isNavVisible && NavComponent()}
      <Container>
        {!useMobileVersion && isNavVisible && NavComponent()}
        <Main addBackground={pathname === dashboardRoute}>{children}</Main>
      </Container>
    </StyledLayout>
  )
}

Layout.propTypes = {
  children: PropTypes.node,
  user: PropTypes.shape({
    firstName: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  isFilesServiceUp: PropTypes.bool.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

export default withRouter(Layout)
