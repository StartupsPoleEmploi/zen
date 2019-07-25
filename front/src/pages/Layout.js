import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import File from '@material-ui/icons/Description'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import FormatListBulleted from '@material-ui/icons/FormatListBulleted'
import Check from '@material-ui/icons/Check'
import Person from '@material-ui/icons/PersonOutline'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import React, { Fragment, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import AppTitle from '../components/Generic/AppTitle'
import { primaryBlue, mobileBreakpoint } from '../constants'

const stepperRoutes = ['/actu', '/employers', '/files']
const [declarationRoute, employersRoute, filesRoute] = stepperRoutes
const routesWithDisplayedNav = stepperRoutes.concat('/thanks')

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

  @media (max-width: ${mobileBreakpoint}) {
    padding-top: 2rem;
  }
`

const StyledTabs = styled(Tabs).attrs({ component: 'nav', role: 'navigation' })`
  && {
    /* Get the active tab indicator */
    & div[role='tablist'] > span {
      height: 0.3rem;
    }
  }
`

const Nav = styled.nav.attrs({ role: 'navigation' })`
  flex-shrink: 0;
  width: 25rem;
  border-right: 1px #ddd solid;
  height: 100vh;
`

const AppTitleContainer = styled.div`
  text-align: center;
  border-bottom: 1px #ddd solid;
  padding: 2rem;
`

const AppTitleMobileContainer = styled.div`
  padding-left: 2rem;
  padding-top: 0.5rem;
`

const UlStepper = styled.ul`
  display: flex;
  flex-direction: column;
  padding-left: 0;
  padding-top: 2rem;
`

const LiStep = styled(Typography).attrs({ component: 'li' })`
  && {
    display: flex;
    align-items: center;
    padding-left: 5rem;
    line-height: 3rem;
    border-left: #fff 0.5rem solid;
    color: rgba(0, 0, 0, 0.5);

    &&.Stepper__Active {
      border-left: ${primaryBlue} 0.5rem solid;
      color: #000;
    }

    &:last-child {
      margin-top: 3rem;
    }
  }
`

const DesktopLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #000;
  text-decoration: none;

  &:visited {
    color: #000;
  }

  &:hover {
    text-decoration: underline;
    color: ${primaryBlue};
  }

  &&.Stepper__Active__Link {
    color: ${primaryBlue};
  }
`

const FileIcon = styled(File)`
  width: 2.5rem;
  margin-right: 1rem;
`

const CheckIcon = styled(Check)`
  width: 2.5rem;
  margin-right: 1rem;
`

const SmallGreenCheckIcon = styled(Check)`
  && {
    color: green;
    font-size: 2rem;
    margin-right: 0.5rem;
  }
`

const ListIcon = styled(FormatListBulleted)`
  width: 2.5rem;
  margin-right: 1rem;
`

const SubLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Layout = ({
  activeMonth,
  activeDeclaration,
  children,
  classes,
  user,
  location: { pathname },
  history: { push },
}) => {
  const [isTooltipOpened, setTooltipOpened] = useState(false)
  const toggleTooltip = () => setTooltipOpened(!isTooltipOpened)

  const isNavVisible = routesWithDisplayedNav.includes(pathname)

  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`)

  // eslint-disable-next-line react/prop-types
  const getStepperItem = ({ label, link, shouldActivateLink, isActive }) => {
    const liProps = {
      className: isActive ? 'Stepper__Active' : '',
      'aria-current': isActive ? 'page' : null,
    }
    if (shouldActivateLink) {
      return (
        <LiStep {...liProps}>
          <DesktopLink
            to={link}
            className={isActive ? 'Stepper__Active__Link' : ''}
          >
            {label}
          </DesktopLink>
        </LiStep>
      )
    }

    return <LiStep {...liProps}>{label}</LiStep>
  }

  const userCanDeclare =
    !get(user, 'hasAlreadySentDeclaration') && get(user, 'canSendDeclaration')

  const shouldActivateDeclarationLink =
    !!activeMonth &&
    (!activeDeclaration || !activeDeclaration.hasFinishedDeclaringEmployers) &&
    userCanDeclare

  const shouldActivateEmployersLink =
    !!activeMonth &&
    !!activeDeclaration &&
    !activeDeclaration.hasFinishedDeclaringEmployers &&
    userCanDeclare

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
              <UserButton onClick={toggleTooltip} disableRipple>
                <PersonIcon />
                {user.firstName}
                {isTooltipOpened ? <ExpandLess /> : <ExpandMore />}
              </UserButton>
            </Tooltip>
          </ClickAwayListener>
        )}
      </Header>

      {useMobileVersion && isNavVisible && (
        <StyledTabs
          variant="fullWidth"
          value={pathname}
          indicatorColor="primary"
        >
          <Tab
            label="Ma situation"
            disabled={!shouldActivateDeclarationLink}
            value={declarationRoute}
            onClick={() => push(declarationRoute)}
            role="link"
          />
          <Tab
            label="Mes employeurs"
            disabled={!shouldActivateEmployersLink}
            value={employersRoute}
            onClick={() => push(employersRoute)}
            role="link"
          />
          <Tab
            label="Mes justificatifs"
            value={filesRoute}
            onClick={() => push(filesRoute)}
            role="link"
          />
        </StyledTabs>
      )}

      <Container>
        {!useMobileVersion && isNavVisible && (
          <Nav>
            <AppTitleContainer>
              <AppTitle />
            </AppTitleContainer>
            <UlStepper>
              {getStepperItem({
                label: (
                  <Fragment>
                    {activeDeclaration &&
                    activeDeclaration.hasFinishedDeclaringEmployers ? (
                      <CheckIcon />
                    ) : (
                      <ListIcon />
                    )}
                    Mon actualisation
                  </Fragment>
                ),
                link: declarationRoute,
                isActive: false,
                shouldActivateLink:
                  shouldActivateDeclarationLink || shouldActivateEmployersLink,
              })}
              {(pathname === declarationRoute ||
                pathname === employersRoute) && (
                <Fragment>
                  {getStepperItem({
                    label: (
                      <SubLabel
                        style={{
                          paddingLeft: activeDeclaration ? '3rem' : '5.5rem',
                        }}
                      >
                        {activeDeclaration && <SmallGreenCheckIcon />}
                        Ma situation
                      </SubLabel>
                    ),
                    link: declarationRoute,
                    shouldActivateLink: shouldActivateDeclarationLink,
                    isActive: pathname === declarationRoute,
                  })}
                  {getStepperItem({
                    label: (
                      <SubLabel
                        style={{
                          paddingLeft: '5.5rem',
                        }}
                      >
                        Mes employeurs
                      </SubLabel>
                    ),
                    link: employersRoute,
                    shouldActivateLink: shouldActivateEmployersLink,
                    isActive: pathname === employersRoute,
                  })}
                </Fragment>
              )}
              {getStepperItem({
                label: (
                  <Fragment>
                    <FileIcon /> Mes justificatifs
                  </Fragment>
                ),
                link: filesRoute,
                shouldActivateLink: true,
                isActive: pathname === filesRoute,
              })}
            </UlStepper>
          </Nav>
        )}
        <Main>{children}</Main>
      </Container>
    </StyledLayout>
  )
}

Layout.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    csrfToken: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

export default withRouter(withStyles(styles)(Layout))
