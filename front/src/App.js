/* eslint-disable react/no-did-update-set-state */
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { hot } from 'react-hot-loader'
import { Link, Redirect, Route, Switch, withRouter } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'
import { get } from 'lodash'

import PrivateRoute from './components/Generic/PrivateRoute'
import { getUser } from './lib/user'
import Actu from './pages/actu/Actu'
import { Employers } from './pages/actu/Employers'
import { Files } from './pages/actu/Files'
import { Thanks } from './pages/actu/Thanks'
import { LoggedOut } from './pages/generic/LoggedOut'
import Layout from './pages/Layout'
import Signup from './pages/other/Signup'
import Home from './pages/home/Home'
import DeclarationAlreadySentDialog from './components/Actu/DeclarationAlreadySentDialog'
import UnableToDeclareDialog from './components/Actu/UnableToDeclareDialog'
import StatusErrorDialog from './components/Actu/StatusErrorDialog'

const stepperRoutes = ['/actu', '/employers', '/files']
const [declarationRoute, employersRoute, filesRoute] = stepperRoutes

const StyledLink = styled(Link)`
  color: #39679e;
  text-decoration: none;

  &:visited {
    color: #39679e;
  }

  & > * {
    /* override Typography font color */
    color: #39679e !important;
  }
`

const UlStepper = styled.ul`
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  list-style: none;
  padding-left: 0;

  & > * {
    flex: 0 1 15rem;
    text-align: center;
    padding-top: 1rem;
    opacity: 0.5;

    &.Stepper__ContainsLink {
      opacity: 1;
    }
    &.Stepper__Active {
      font-weight: bold;
      text-decoration: underline;
      opacity: 1;
    }

    @media (max-width: 650px) {
      &:not(.Stepper__Active) {
        display: none !important;
      }
    }

    &:not(:last-child) {
      border-right: 0.1rem solid #f0f0f0;
    }
  }
`

const LiStep = styled(Typography).attrs({ component: 'li' })`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

class App extends Component {
  static propTypes = {
    history: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
      .isRequired,
  }

  state = {
    activeDeclaration: null,
    activeMonth: null,
    err: null,
    isLoadingInitialData: true,
    isLoadingActiveDeclaration: true,
    user: null,
    showDeclarationSentOnPEModal: false,
    showUnableToSendDeclarationModal: false,
    isServiceDown: false,
  }

  componentDidMount() {
    Promise.all([
      superagent.get('/api/status').then((res) => res.body),
      getUser(),
    ])
      .then(([status, user]) => {
        if (!status.up) {
          return this.setState({ isServiceDown: true })
        }

        if (!user) return

        this.setState({ user })

        window.Raven.setUserContext({
          id: user.id,
        })
        if (!user.isTokenValid) {
          window.location = '/api/login'
          return
        }

        return Promise.all([
          superagent
            .get('/api/declarations?active')
            .then((res) => res.body)
            .catch((err) => {
              // 404 are the normal status when no declaration was made.
              if (err.status !== 404) throw err
            }),
          superagent
            .get('/api/declarationMonths?active')
            .then((res) => res.body),
        ]).then(([activeDeclaration, activeMonthString]) => {
          // Redirect the user to the last page he hasn't completed
          const activeMonth =
            (activeMonthString && new Date(activeMonthString)) || null
          this.setState({
            activeMonth,
            activeDeclaration,
          })

          if (!user.isAuthorized) return

          if (!activeMonth) return this.props.history.replace('/files')

          // Log and handle cases when user can't declare using Zen
          // because he's already declared his situation using PE.fr
          // or we can't get declaration data
          if (!get(activeDeclaration, 'hasFinishedDeclaringEmployers')) {
            // User has no declaration, or it isn't already sent
            if (user.hasAlreadySentDeclaration) {
              // show modal once, and redirect to /files
              this.props.history.replace('/files')
              this.setState({ showDeclarationSentOnPEModal: true })
              window.Raven.captureException(
                new Error('User has already sent declaration on pe.fr'),
              )
              return
            }
            if (!user.canSendDeclaration) {
              // something is broken, or user has no access to declarations. Show sorry modal.
              this.props.history.replace('/files')
              window.Raven.captureException(
                new Error('Cannot get declaration data'),
              )
              return this.setState({
                showUnableToSendDeclarationModal: true,
              })
            }
          }

          if (activeDeclaration) {
            if (activeDeclaration.hasFinishedDeclaringEmployers) {
              return this.props.history.replace('/files')
            }
            return this.props.history.replace('/employers')
          }
        })
      })
      .then(() =>
        this.setState({
          isLoadingInitialData: false,
          isLoadingActiveDeclaration: false,
        }),
      )
      .catch((err) =>
        this.setState({
          isLoadingInitialData: false,
          isLoadingActiveDeclaration: false,
          err,
        }),
      )
  }

  static getDerivedStateFromProps(props, state) {
    if (
      get(state.user, 'isAuthorized') &&
      props.location.pathname !== state.pathname
    ) {
      return {
        isLoadingActiveDeclaration: true,
        pathname: props.location.pathname,
      }
    }
    return null
  }

  componentDidUpdate(prevProps) {
    if (
      get(this.state.user, 'isAuthorized') &&
      this.props.location.pathname !== prevProps.location.pathname
    ) {
      return superagent
        .get('/api/declarations?active')
        .then((res) => res.body)
        .then((activeDeclaration) =>
          this.setState({
            activeDeclaration,
            isLoadingActiveDeclaration: false,
          }),
        )
        .catch((err) =>
          this.setState({
            isLoadingActiveDeclaration: false,
            err: err.status === 404 ? null : err,
          }),
        )
    }
  }

  componentDidCatch(err, errorInfo) {
    this.setState({ err })
    window.Raven.captureException(err, { extra: errorInfo })
  }

  onCloseModal = () => {
    this.setState({
      showDeclarationSentOnPEModal: false,
      showUnableToSendDeclarationModal: false,
    })
  }

  getStepperItem = ({ label, link, shouldActivateLink, isActive }) => {
    if (shouldActivateLink) {
      return (
        <LiStep className="Stepper__ContainsLink">
          <StyledLink to={link}>{label}</StyledLink>
        </LiStep>
      )
    }

    return (
      <LiStep className={isActive ? 'Stepper__Active' : ''}>{label}</LiStep>
    )
  }

  render() {
    const {
      location: { pathname },
    } = this.props
    const {
      activeDeclaration,
      activeMonth,
      err,
      isLoadingInitialData,
      isLoadingActiveDeclaration,
      user,
    } = this.state

    if (isLoadingInitialData) return null

    if (!user) {
      // User isn't logged
      if (pathname !== '/') {
        return <Redirect to="/" />
      }
    } else if (!user.isAuthorized) {
      // User is logged but not authorized
      if (pathname !== '/signup') {
        return <Redirect to="/signup" />
      }
      // User is logged
    } else if (pathname === '/') {
      return <Redirect to="/actu" />
    }

    if (err) {
      return (
        <Layout user={user}>
          <Typography>
            Une erreur s'est produite, merci de réessayer ultérieurement
          </Typography>
        </Layout>
      )
    }

    const userCanDeclare =
      !get(user, 'hasAlreadySentDeclaration') && get(user, 'canSendDeclaration')

    const shouldActivateDeclarationLink =
      !!activeMonth &&
      (!activeDeclaration ||
        !activeDeclaration.hasFinishedDeclaringEmployers) &&
      pathname !== declarationRoute &&
      userCanDeclare

    const shouldActivateEmployersLink =
      !!activeMonth &&
      !!activeDeclaration &&
      !activeDeclaration.hasFinishedDeclaringEmployers &&
      pathname !== employersRoute &&
      userCanDeclare

    const shouldActivateFilesLink = pathname !== filesRoute

    const stepper = stepperRoutes.includes(pathname) ? (
      <UlStepper>
        {this.getStepperItem({
          label: 'Ma situation',
          link: declarationRoute,
          shouldActivateLink: shouldActivateDeclarationLink,
          isActive: pathname === declarationRoute,
        })}
        {this.getStepperItem({
          label: 'Mes employeurs',
          link: employersRoute,
          shouldActivateLink: shouldActivateEmployersLink,
          isActive: pathname === employersRoute,
        })}
        {this.getStepperItem({
          label: 'Mes documents',
          link: filesRoute,
          shouldActivateLink: shouldActivateFilesLink,
          isActive: pathname === filesRoute,
        })}
      </UlStepper>
    ) : null

    if (pathname === '/') {
      return (
        <Fragment>
          <Route exact path="/" component={Home} />
          <StatusErrorDialog isOpened={this.state.isServiceDown} />
        </Fragment>
      )
    }

    if (isLoadingActiveDeclaration) {
      return (
        <Layout user={user} stepper={stepper}>
          <div style={{ margin: '5rem', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        </Layout>
      )
    }

    return (
      <Layout user={user} stepper={stepper}>
        <Switch>
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/actu"
            render={(props) => (
              <Actu
                {...props}
                activeMonth={activeMonth}
                declaration={activeDeclaration}
                user={user}
              />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/employers"
            render={(props) => (
              <Employers
                {...props}
                activeMonth={activeMonth}
                token={user.csrfToken}
              />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/files"
            render={(props) => (
              <Files
                {...props}
                activeMonth={activeMonth}
                token={user.csrfToken}
              />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/thanks"
            render={(props) => (
              <Thanks
                {...props}
                activeMonth={activeMonth}
                token={user.csrfToken}
              />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/signup"
            render={(props) => <Signup {...props} user={user} />}
          />

          <Route exact path="/loggedOut" component={LoggedOut} />
          <Route render={() => <div>404</div>} />
        </Switch>

        <StatusErrorDialog isOpened={this.state.isServiceDown} />
        <DeclarationAlreadySentDialog
          isOpened={this.state.showDeclarationSentOnPEModal}
          onCancel={this.onCloseModal}
        />
        <UnableToDeclareDialog
          isOpened={this.state.showUnableToSendDeclarationModal}
          onCancel={this.onCloseModal}
        />
      </Layout>
    )
  }
}

export default hot(module)(withRouter(App))
