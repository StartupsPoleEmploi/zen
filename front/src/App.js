import Typography from '@material-ui/core/Typography'
import CheckCircle from '@material-ui/icons/CheckCircle'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
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
import Home from './pages/home/Home'
import Layout from './pages/Layout'
import Signup from './pages/other/Signup'
import DeclarationAlreadySentDialog from './components/Actu/DeclarationAlreadySentDialog'
import UnableToDeclareDialog from './components/Actu/UnableToDeclareDialog'
import StatusErrorDialog from './components/Actu/StatusErrorDialog'

const steps = ['Ma situation', 'Mes employeurs', 'Mes documents']

const stepsNumbers = ['/actu', '/employers', '/files']

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
    border-top: 0.2rem solid black;
    text-align: center;
    padding-top: 1rem;
    &.active {
      font-weight: bold;
    }

    @media (max-width: 650px) {
      &:not(.active) {
        display: none !important;
      }
    }
  }

  & > a {
    border-top: 0.2rem solid #39679e;
  }
`

const LiStep = styled(Typography).attrs({ component: 'li' })`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const CheckCircleIcon = styled(CheckCircle)`
  && {
    font-size: 1.5rem;
    margin-right: 1rem;
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
    activeMonth: null,
    err: null,
    isLoading: true,
    lastDeclaration: null,
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
          return this.setState({ isServiceDown: true, isLoading: false })
        }

        if (!user) return this.setState({ isLoading: false })

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
            .get('/api/declarations?last')
            .then((res) => res.body)
            .then((declaration) => {
              this.setState({ lastDeclaration: declaration })
              return declaration
            })
            .catch((err) => {
              // 404 are the normal status when no declaration was made.
              if (err.status !== 404) throw err
            }),
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
        ]).then(([lastDeclaration, activeDeclaration, activeMonthString]) => {
          // Redirect the user to the last page he hasn't completed
          const activeMonth =
            (activeMonthString && new Date(activeMonthString)) || null
          this.setState({
            activeMonth,
            isLoading: false,
          })

          if (!user.isAuthorized) return

          if (activeMonth) {
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
                window.Raven.captureException(
                  new Error('Cannot get declaration data'),
                )
                return this.setState({
                  showUnableToSendDeclarationModal: true,
                })
              }
            }
          }

          if (
            !activeMonth &&
            !lastDeclaration.isFinished &&
            lastDeclaration.hasFinishedDeclaringEmployers
          ) {
            return this.props.history.replace('/files')
          }

          if (activeDeclaration) {
            if (activeDeclaration.hasFinishedDeclaringEmployers) {
              return this.props.history.replace('/files')
            }
            if (activeDeclaration.hasWorked) {
              return this.props.history.replace('/employers')
            }
          }
          return this.props.history.replace('/')
        })
      })
      .catch((err) => this.setState({ isLoading: false, err }))
  }

  componentDidCatch(err, errorInfo) {
    this.setState({ err })
    window.Raven.captureException(err, { extra: errorInfo })
  }

  onCloseModal = () => {
    this.setState({
      showDeclarationSentOnPEModal: false,
    })
  }

  render() {
    const {
      location: { pathname },
    } = this.props
    const { activeMonth, err, isLoading, lastDeclaration, user } = this.state
    if (isLoading) return null

    if (!user) {
      if (pathname === '/') {
        return (
          <React.Fragment>
            <Route exact path="/" component={Home} />
            <StatusErrorDialog isOpened={this.state.isServiceDown} />
          </React.Fragment>
        )
      }
      return <Redirect to="/" />
    }

    if (pathname === '/') {
      if (!user.isAuthorized) return <Redirect to="/signup" />
      return <Redirect to="/actu" />
    }

    // Deactivate the service if no active month
    // Except if the user's last declaration has files that need sending
    const shouldTakeUserToFilesScreenForOldDocuments =
      !activeMonth &&
      lastDeclaration &&
      lastDeclaration.hasFinishedDeclaringEmployers &&
      !lastDeclaration.isFinished

    if (
      !activeMonth &&
      !shouldTakeUserToFilesScreenForOldDocuments &&
      pathname !== '/signup'
    ) {
      return (
        <Layout user={user}>
          <Typography>
            Le service Zen est désactivé jusqu'à la prochaine période
            d'actualisation. Pour toute information ou démarche, rendez vous sur{' '}
            <a href="https://www.pole-emploi.fr">https://www.pole-emploi.fr</a>
          </Typography>
        </Layout>
      )
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

    const activeStep = stepsNumbers.indexOf(pathname)

    const stepper =
      activeStep !== -1 ? (
        <UlStepper>
          {steps.map(
            (label, index) =>
              // Disable navigation back on last step
              index >= activeStep || activeStep >= 2 ? (
                <LiStep
                  key={label}
                  className={index === activeStep ? 'active' : ''}
                >
                  {activeStep > index && <CheckCircleIcon />}
                  {label}
                </LiStep>
              ) : (
                <StyledLink key={label} to={stepsNumbers[index]}>
                  <LiStep>
                    {activeStep > index && <CheckCircleIcon />} {label}
                  </LiStep>
                </StyledLink>
              ),
          )}
        </UlStepper>
      ) : null

    return (
      <Layout user={user} stepper={stepper}>
        <Switch>
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/actu"
            render={(props) => (
              <Actu {...props} activeMonth={activeMonth} user={user} />
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

        <DeclarationAlreadySentDialog
          isOpened={this.state.showDeclarationSentOnPEModal}
          onCancel={this.onCloseModal}
        />
        <UnableToDeclareDialog
          /* This is not a modal we want to be closable */
          isOpened={this.state.showUnableToSendDeclarationModal}
        />
      </Layout>
    )
  }
}

export default hot(module)(withRouter(App))
