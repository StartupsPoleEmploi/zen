import { get } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Check from '@material-ui/icons/Check'

import RestoreIcon from '@material-ui/icons/Restore'
import HomeOutlined from '@material-ui/icons/HomeOutlined'
import DnsOutlined from '@material-ui/icons/DnsOutlined'
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined'

import AppTitle from '../Generic/AppTitle'
import { primaryBlue, mobileBreakpoint } from '../../constants'

const stepperRoutes = [
  '/actu',
  '/employers',
  '/files',
  '/dashboard',
  '/history',
]
const [
  declarationRoute,
  employersRoute,
  filesRoute,
  dashboardRoute,
  historyRoute,
] = stepperRoutes
const routesWithDisplayedNav = stepperRoutes.concat('/thanks')

const StyledTabs = styled(Tabs).attrs({ component: 'nav', role: 'navigation' })`
  && {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 5;
    border-radius: 2rem 2rem 0 0;
    background-color: rgb(250, 250, 250);

    & div[role='tablist'] > span {
      height: 0.3rem;
    }

    .MuiTabs-indicator {
      top: 0;
    }
  }
`

const Nav = styled.nav.attrs({ role: 'navigation' })`
  flex-shrink: 0
  background: #fafafa;
  width: 25rem;
  border-right: 1px #ddd solid;
  min-height: 100vh;
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
    color: rgba(0, 0, 0, 0.5) !important;
    text-transform: none;

    &&.Stepper__Active {
      img {
        color: ${primaryBlue};
      }
      border-left: ${primaryBlue} 0.5rem solid;
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

const StyledTab = styled(Tab)`
  && {
    text-transform: none;
    overflow: visible;
    padding-top: 2rem;
    opacity: 1;
    color: black;
    border-top: solid 1px #e2e2e2;

    &&.Mui-selected {
      facolor: ${primaryBlue};
      font-weight: bold;

      svg {
        color: ${primaryBlue} !important;
        opacity: 1;
      }
    }
  }
`

const HomeTab = styled(StyledTab)`
  && {
    min-width: inherit;
    @media (max-width: 350px) {
      flex-grow: inherit;
      width: 100px;
    }
  }
`

const FileIcon = styled(DescriptionOutlined)`
  font-size: 1.5rem;
  margin-right: 1.4rem;
  margin-left: 0.2rem;
  color: #1e2c59;
  opacity: 0.7;

  @media (max-width: ${mobileBreakpoint}) {
    margin-right: 0;
  }
`
const HomeIcon = styled(HomeOutlined)`
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #1e2c59;
  opacity: 0.7;
  @media (max-width: ${mobileBreakpoint}) {
    margin-right: 0;
  }
`

const ListIcon = styled(DnsOutlined)`
  font-size: 1.5rem;
  margin-right: 1.1rem;
  color: #1e2c59;
  opacity: 0.7;
  @media (max-width: ${mobileBreakpoint}) {
    margin-right: 0;
  }
`

const RestoreIconImg = styled(RestoreIcon)`
  width: 2.5rem;
  margin-right: 1rem;
  color: #1e2c59;
  opacity: 0.7;
  @media (max-width: ${mobileBreakpoint}) {
    margin-right: 0;
  }
`

const CheckIcon = styled(Check)`
  width: 2.5rem;
  margin-right: 1rem;
  @media (max-width: ${mobileBreakpoint}) {
    margin-right: 0;
  }
`

const SmallGreenCheckIcon = styled(Check)`
  && {
    color: green;
    font-size: 2rem;
    margin-right: 0.5rem;
  }
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
          style={{ fontWeight: isActive ? 'bold' : null }}
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
  isFilesServiceUp,
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

  // Mobile version
  if (useMobileVersion && isNavVisible) {
    const actuRoute =
      activeDeclaration && !activeDeclaration.hasFinishedDeclaringEmployers
        ? employersRoute
        : declarationRoute

    return (
      <StyledTabs
        variant="fullWidth"
        value={pathname}
        indicatorColor="primary"
        in
      >
        <HomeTab
          label={
            <>
              <HomeIcon alt="" />
              Accueil
            </>
          }
          disabled={false}
          value={dashboardRoute}
          onClick={() => push(dashboardRoute)}
          role="link"
        />
        <StyledTab
          label={
            <>
              <ListIcon alt="" />
              Actualisation
            </>
          }
          disabled={!shouldActivateDeclarationLink}
          value={actuRoute}
          onClick={() => push(actuRoute)}
          role="link"
        />
        <StyledTab
          label={
            <>
              <FileIcon alt="" />
              Justificatifs
            </>
          }
          value={filesRoute}
          disabled={!isFilesServiceUp}
          onClick={() => push(filesRoute)}
          role="link"
        />
        <StyledTab
          label={
            <>
              <RestoreIconImg alt="" />
              Historique
            </>
          }
          value={historyRoute}
          disabled={!isFilesServiceUp}
          onClick={() => push(historyRoute)}
          role="link"
        />
      </StyledTabs>
    )
  }

  // Desktop version
  return (
    <Nav>
      <AppTitleContainer>
        <AppTitle />
      </AppTitleContainer>
      <UlStepper>
        <StepperItem
          label={
            <>
              <HomeIcon alt="" /> Accueil
            </>
          }
          link={dashboardRoute}
          shouldActivateLink={!user.needOnBoarding}
          isActive={pathname === dashboardRoute}
        />
        {!user.isBlocked && (
          <StepperItem
            label={
              <>
                {activeDeclaration &&
                activeDeclaration.hasFinishedDeclaringEmployers ? (
                  <CheckIcon />
                ) : (
                  <ListIcon alt="" />
                )}
                Mon actualisation
              </>
            }
            link={declarationRoute}
            shouldActivateLink={
              (shouldActivateDeclarationLink || shouldActivateEmployersLink) &&
              !user.needOnBoarding
            }
            isActive={false}
          />
        )}
        {(pathname === declarationRoute || pathname === employersRoute) && (
          <>
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
              shouldActivateLink={
                shouldActivateDeclarationLink && !user.needOnBoarding
              }
              isActive={pathname === declarationRoute}
            />
            <StepperItem
              label={
                <SubLabel style={{ paddingLeft: '5.5rem' }}>
                  Mes employeurs
                </SubLabel>
              }
              link={employersRoute}
              shouldActivateLink={
                shouldActivateEmployersLink && !user.needOnBoarding
              }
              isActive={pathname === employersRoute}
            />
          </>
        )}

        <StepperItem
          label={
            <>
              <FileIcon alt="" /> Mes justificatifs
            </>
          }
          link={filesRoute}
          shouldActivateLink={isFilesServiceUp && !user.needOnBoarding}
          isActive={pathname === filesRoute && isFilesServiceUp}
        />

        <StepperItem
          label={
            <>
              <RestoreIconImg alt="" /> Mon historique
            </>
          }
          link={historyRoute}
          shouldActivateLink={!user.needOnBoarding}
          isActive={pathname === historyRoute && isFilesServiceUp}
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
    needOnBoarding: PropTypes.bool,
  }),
  isFilesServiceUp: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

NavLogin.defaultProps = {
  isFilesServiceUp: false,
}

export default withRouter(NavLogin)
