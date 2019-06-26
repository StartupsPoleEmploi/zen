import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import File from '@material-ui/icons/Description'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import FormatListBulleted from '@material-ui/icons/FormatListBulleted'
import ArrowDown from '@material-ui/icons/KeyboardArrowDown'
import ArrowUp from '@material-ui/icons/KeyboardArrowUp'
import Person from '@material-ui/icons/PersonOutline'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import React, { Fragment, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import AppTitle from '../components/Generic/AppTitle'
import { primaryBlue } from '../constants/colors'

const stepperRoutes = ['/actu', '/employers', '/files']
const [declarationRoute, employersRoute, filesRoute] = stepperRoutes

const breakpoint = '672px'

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
  justify-content: flex-end;
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

const Main = styled.main`
  padding: 7rem 1rem;
  flex-grow: 1;
`

const Nav = styled.nav`
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
    line-height: 4rem;
    border-left: #fff 0.5rem solid;

    &&.Stepper__Active {
      border-left: ${primaryBlue} 0.5rem solid;
    }
  }
`

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${primaryBlue};
  text-decoration: none;
  font-weight: bold;

  &:visited {
    color: #000;
  }

  &:hover {
    text-decoration: underline;
  }

  &&.Stepper__Active__Link {
    color: ${primaryBlue};
  }
`

const Placeholder = styled.span`
  display: inline-block;
  width: 3.5rem;
`

const FileIcon = styled(File)`
  width: 2.5rem;
  margin-right: 1rem;
`

const ListIcon = styled(FormatListBulleted)`
  width: 2.5rem;
  margin-right: 1rem;
`

export const Layout = ({
  activeMonth,
  activeDeclaration,
  children,
  classes,
  user,
  location: { pathname },
}) => {
  const [isTooltipOpened, setTooltipOpened] = useState(false)

  // eslint-disable-next-line react/prop-types
  const getStepperItem = ({ label, link, shouldActivateLink, isActive }) => {
    if (shouldActivateLink) {
      return (
        <LiStep className={isActive ? 'Stepper__Active' : ''}>
          <StyledLink
            to={link}
            className={isActive ? 'Stepper__Active__Link' : ''}
          >
            {label}
          </StyledLink>
        </LiStep>
      )
    }

    return (
      <LiStep className={isActive ? 'Stepper__Active' : ''}>{label}</LiStep>
    )
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

  const useMobileVersion = useMediaQuery(`(max-width:${breakpoint})`) // eslint-disable-line

  return (
    <StyledLayout>
      <Header>
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
              <UserButton onClick={() => setTooltipOpened(true)} disableRipple>
                <PersonIcon />
                {user.firstName}
                {isTooltipOpened ? <ExpandLess /> : <ExpandMore />}
              </UserButton>
            </Tooltip>
          </ClickAwayListener>
        )}
      </Header>
      <Container>
        <div>
          <Nav>
            <AppTitleContainer>
              <AppTitle />
            </AppTitleContainer>
            <UlStepper>
              {getStepperItem({
                label: (
                  <Fragment>
                    <ListIcon /> Mon actualisation
                    {activeMonth &&
                      (pathname === declarationRoute ||
                      pathname === employersRoute ? (
                        <ArrowDown />
                      ) : (
                        <ArrowUp />
                      ))}
                  </Fragment>
                ),
                link: declarationRoute,
                isActive:
                  pathname === declarationRoute || pathname === employersRoute,
                shouldActivateLink:
                  shouldActivateDeclarationLink || shouldActivateEmployersLink,
              })}
              {(pathname === declarationRoute ||
                pathname === employersRoute) && (
                <Fragment>
                  {getStepperItem({
                    label: (
                      <Fragment>
                        <Placeholder /> Ma situation
                      </Fragment>
                    ),
                    link: declarationRoute,
                    shouldActivateLink: shouldActivateDeclarationLink,
                    isActive: pathname === declarationRoute,
                  })}
                  {getStepperItem({
                    label: (
                      <Fragment>
                        <Placeholder /> Mes employeurs
                      </Fragment>
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
        </div>
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
    replace: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

export default withRouter(withStyles(styles)(Layout))
