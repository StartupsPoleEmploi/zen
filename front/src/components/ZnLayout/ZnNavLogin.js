import { get } from 'lodash'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Link, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Check from '@material-ui/icons/Check'

import AppTitle from '../Generic/AppTitle'
import { primaryBlue, mobileBreakpoint } from '../../constants'
import file from '../../images/files.svg'
import actu from '../../images/actu.svg'
import home from '../../images/home.svg'

const stepperRoutes = ['/actu', '/employers', '/files', '/dashboard', '/cgu']
const [
  declarationRoute,
  employersRoute,
  filesRoute,
  dashboardRoute,
  cguRoute,
] = stepperRoutes
const routesWithDisplayedNav = stepperRoutes.concat('/thanks')

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
  background: #fafafa;
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

  > li {
    margin-top: 3rem;
  }
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

const FileIcon = styled.img`
  font-size: 1.5rem;
  margin-right: 1.4rem;
  margin-left: 0.2rem;
`
const HomeIcon = styled.img`
  font-size: 1.5rem;
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

const ListIcon = styled.img`
  font-size: 1.5rem;
  margin-right: 1.1rem;
`

const SubLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

// eslint-disable-next-line react/prop-types
const StepperItem = ({ label, link, shouldActivateLink, isActive }) => {
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

export const NavLogin = ({
  activeMonth,
  activeDeclaration,
  user,
  location: { pathname },
  history: { push },
}) => {
  const isNavVisible = routesWithDisplayedNav.includes(pathname)

  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`)

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

  if (useMobileVersion && isNavVisible) {
    return (
      <StyledTabs variant="fullWidth" value={pathname} indicatorColor="primary">
        <Tab
          label="Situation"
          disabled={!shouldActivateDeclarationLink}
          value={declarationRoute}
          onClick={() => push(declarationRoute)}
          role="link"
        />
        <Tab
          label="Employeurs"
          disabled={!shouldActivateEmployersLink}
          value={employersRoute}
          onClick={() => push(employersRoute)}
          role="link"
        />
        <Tab
          label="Justificatifs"
          value={filesRoute}
          onClick={() => push(filesRoute)}
          role="link"
        />
      </StyledTabs>
    )
  }

  return (
    <Nav>
      <AppTitleContainer>
        <AppTitle />
      </AppTitleContainer>
      <UlStepper>
        <StepperItem
          label={
            <Fragment>
              <HomeIcon src={home} alt="" /> Accueil
            </Fragment>
          }
          link={dashboardRoute}
          shouldActivateLink
          isActive={pathname === dashboardRoute}
        />
        {!user.isBlocked && (
          <StepperItem
            label={
              <Fragment>
                {activeDeclaration &&
                activeDeclaration.hasFinishedDeclaringEmployers ? (
                  <CheckIcon />
                ) : (
                  <ListIcon src={actu} alt="" />
                )}
                Mon actualisation
              </Fragment>
            }
            link={declarationRoute}
            shouldActivateLink={
              shouldActivateDeclarationLink || shouldActivateEmployersLink
            }
            isActive={false}
          />
        )}
        {(pathname === declarationRoute || pathname === employersRoute) && (
          <Fragment>
            <StepperItem
              label={
                <SubLabel
                  style={{
                    paddingLeft: activeDeclaration ? '3rem' : '5.5rem',
                  }}
                >
                  {activeDeclaration && <SmallGreenCheckIcon />}
                  Ma situation
                </SubLabel>
              }
              link={declarationRoute}
              shouldActivateLink={shouldActivateDeclarationLink}
              isActive={pathname === declarationRoute}
            />
            <StepperItem
              label={
                <SubLabel style={{ paddingLeft: '5.5rem' }}>
                  Mes employeurs
                </SubLabel>
              }
              link={employersRoute}
              shouldActivateLink={shouldActivateEmployersLink}
              isActive={pathname === employersRoute}
            />
          </Fragment>
        )}

        <StepperItem
          label={
            <Fragment>
              <FileIcon src={file} alt="" /> Mes justificatifs
            </Fragment>
          }
          link={filesRoute}
          shouldActivateLink
          isActive={pathname === filesRoute}
        />
      </UlStepper>
      <UlStepper style={{ position: 'absolute', bottom: '0px' }}>
        <StepperItem
          label="CGU"
          link={cguRoute}
          shouldActivateLink
          isActive={pathname.startsWith(cguRoute)}
        />
      </UlStepper>
    </Nav>
  )
}

NavLogin.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    csrfToken: PropTypes.string,
    isBlocked: PropTypes.bool,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

export default withRouter(NavLogin)
