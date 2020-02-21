/* eslint-disable react/no-did-update-set-state */
/* eslint-disable  react/jsx-props-no-spreading */
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'

import { fetchUser as fetchUserAction } from './redux/actions/user'
import { fetchStatus as fetchStatusAction } from './redux/actions/status'
import {
  fetchActiveDeclaration as fetchActiveDeclarationAction,
  hideDeclarationTransmittedDialog as hideDeclarationTransmittedDialogAction,
} from './redux/actions/declarations'
import { fetchActiveMonth as fetchActiveMonthAction } from './redux/actions/activeMonth'
import DeclarationAlreadySentDialog from './components/Actu/DeclarationAlreadySentDialog'
import StatusErrorDialog from './components/Actu/StatusErrorDialog'
import UnableToDeclareDialog from './components/Actu/UnableToDeclareDialog'
import DeclarationTransmittedDialog from './components/Actu/DeclarationTransmittedDialog'
import PrivateRoute from './components/Generic/PrivateRoute'

import Actu from './pages/actu/Actu'
import Employers from './pages/actu/Employers'
import Dashboard from './pages/dashboard/Dashboard'
import Files from './pages/actu/Files'
import Thanks from './pages/actu/Thanks'
import { LoggedOut } from './pages/generic/LoggedOut'
import Home from './pages/home/Home'
import History from './pages/history/History'
import ZnLayout from './components/ZnLayout'
import NotAutorized from './pages/other/NotAutorized'
import AddEmail from './pages/other/AddEmail'
import Cgu from './pages/other/Cgu'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      err: null,
      showDeclarationSentOnPEModal: false,
      showUnableToSendDeclarationModal: false,
      hasFinishedInitialLoading: false,
    }
  }

  componentDidMount() {
    Promise.all([this.props.fetchStatus(), this.props.fetchUser()])
      .then(() => {
        if (!this.props.user || !this.props.user.isAuthorized) return

        return Promise.all([
          this.props.fetchActiveDeclaration(),
          this.props.fetchActiveMonth(),
        ])
      })
      .then(() => {
        if (!this.props.user) return
        if (!this.props.activeMonth) return

        // Log and handle cases when user can't declare using Zen
        // because he's already declared his situation using PE.fr
        // or we can't get declaration data
        if (
          !get(this.props.activeDeclaration, 'hasFinishedDeclaringEmployers')
        ) {
          // User has no declaration, or it isn't already sent
          if (this.props.user.hasAlreadySentDeclaration) {
            // show modal once, and redirect to /files
            this.setState({ showDeclarationSentOnPEModal: true })
            window.Raven.captureException(
              new Error('User has already sent declaration on pe.fr'),
            )
            return
          }
          if (!this.props.user.canSendDeclaration) {
            // something is broken, or user has no access to declarations. Show sorry modal.
            window.Raven.captureException(
              new Error('Cannot get declaration data'),
            )
            return this.setState({
              showUnableToSendDeclarationModal: true,
            })
          }
        }
      })
      .then(() => {
        this.setState({ hasFinishedInitialLoading: true })
      })
  }

  componentDidUpdate(prevProps) {
    if (
      get(this.props.user, 'isAuthorized') &&
      this.props.location.pathname !== prevProps.location.pathname
    ) {
      // the active declaration needs to be kept up to date as the user navigates
      // because the layout changes a bit according to what has been done in it.
      this.props.fetchActiveDeclaration()
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

  render() {
    const {
      location: { pathname },
      isServiceStatusLoading,
      activeDeclaration,
      isActiveDeclarationLoading,
      activeMonth,
      isActiveMonthLoading,
      status,
      user,
      isUserLoading,
    } = this.props

    if (isUserLoading || isServiceStatusLoading) return null
    if (!user) {
      // User isn't logged
      if (pathname !== '/' && !pathname.startsWith('/cgu')) {
        return <Redirect to="/" />
      }
    } else if (!user.isAuthorized) {
      // User is logged but not authorized
      if (pathname !== '/not-autorized') {
        return <Redirect to="/not-autorized" />
      }
      // User is logged
    } else if (user.needOnBoarding) {
      // The OnBoarding will asked for the email
      if (pathname !== '/dashboard') {
        return <Redirect to="/dashboard" />
      }
    } else if (!user.email) {
      // User is logged but no email is register
      if (pathname !== '/add-email') {
        return <Redirect to="/add-email" />
      }
      // User is logged
    } else if (pathname === '/') {
      return <Redirect to="/dashboard" />
    }

    if (this.state.err) {
      return (
        <ZnLayout
          user={user}
          activeMonth={activeMonth}
          activeDeclaration={activeDeclaration}
          isFilesServiceUp={false}
        >
          <Typography>
            Nous sommes désolés, mais une erreur s'est produite. Merci de bien
            vouloir recharger à nouveau cette page. Si cela se reproduit, vous
            pouvez contacter l'équipe Zen.
          </Typography>
        </ZnLayout>
      )
    }

    if (!user) {
      return (
        <ZnLayout
          user={user}
          activeMonth={activeMonth}
          activeDeclaration={activeDeclaration}
        >
          <Route exact path="/" component={Home} />
          <Route path="/cgu" component={Cgu} />
          {!status.isLoading && (
            <StatusErrorDialog isOpened={!status.isServiceUp} />
          )}
        </ZnLayout>
      )
    }

    if (
      isActiveDeclarationLoading ||
      isActiveMonthLoading ||
      !this.state.hasFinishedInitialLoading
    ) {
      return (
        <ZnLayout
          user={user}
          isFilesServiceUp={status.isFilesServiceUp}
          activeMonth={activeMonth}
          activeDeclaration={activeDeclaration}
        >
          <div style={{ margin: '5rem', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        </ZnLayout>
      )
    }

    return (
      <ZnLayout
        user={user}
        isFilesServiceUp={status.isFilesServiceUp}
        activeMonth={activeMonth}
        activeDeclaration={activeDeclaration}
      >
        <Switch>
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/dashboard"
            render={(props) => (
              <Dashboard {...props} declaration={activeDeclaration} />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/actu"
            render={(props) =>
              user.isBlocked ? (
                <Redirect to="/dashboard" />
              ) : (
                <Actu
                  {...props}
                  activeMonth={activeMonth}
                  declaration={activeDeclaration}
                  user={user}
                />
              )
            }
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/employers"
            render={(props) =>
              user.isBlocked ? (
                <Redirect to="/dashboard" />
              ) : (
                <Employers {...props} user={user} activeMonth={activeMonth} />
              )
            }
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
                declaration={activeDeclaration}
              />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/history"
            render={(props) => <History {...props} />}
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
            path="/not-autorized"
            component={NotAutorized}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/add-email"
            component={AddEmail}
          />

          <Route exact path="/loggedOut" component={LoggedOut} />
          <Route path="/cgu" component={Cgu} />
          <Route render={() => <div>404</div>} />
        </Switch>
        <StatusErrorDialog isOpened={!!this.state.isServiceDown} />
        <DeclarationAlreadySentDialog
          isOpened={this.state.showDeclarationSentOnPEModal}
          onCancel={this.onCloseModal}
        />
        <UnableToDeclareDialog
          currentPath={pathname}
          isOpened={this.state.showUnableToSendDeclarationModal}
          onCancel={this.onCloseModal}
        />
        <DeclarationTransmittedDialog
          isOpened={this.props.showDeclarationTransmittedDialog}
          onCancel={this.props.hideDeclarationTransmittedDialog}
        />
        {!status.isLoading && (
          <StatusErrorDialog isOpened={!status.isServiceUp} />
        )}
      </ZnLayout>
    )
  }
}

App.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchStatus: PropTypes.func.isRequired,
  fetchActiveDeclaration: PropTypes.func.isRequired,
  fetchActiveMonth: PropTypes.func.isRequired,
  user: PropTypes.object,
  activeMonth: PropTypes.object,
  activeDeclaration: PropTypes.object,
  status: PropTypes.shape({
    isServiceUp: PropTypes.bool,
    isFilesServiceUp: PropTypes.bool,
    isLoading: PropTypes.bool,
  }),
  isServiceStatusLoading: PropTypes.bool,
  isActiveDeclarationLoading: PropTypes.bool,
  isActiveMonthLoading: PropTypes.bool,
  isUserLoading: PropTypes.bool,
  showDeclarationTransmittedDialog: PropTypes.bool,
  hideDeclarationTransmittedDialog: PropTypes.func.isRequired,
}

export default hot(module)(
  withRouter(
    connect(
      (state) => ({
        isServiceUp: state.statusReducer.isServiceUp,
        isServiceStatusLoading: state.statusReducer.isLoading,
        activeDeclaration: state.declarationsReducer.activeDeclaration,
        isActiveDeclarationLoading:
          state.declarationsReducer.isActiveDeclarationLoading,
        showDeclarationTransmittedDialog:
          state.declarationsReducer.showDeclarationTransmittedDialog,
        activeMonth: state.activeMonthReducer.activeMonth,
        isActiveMonthLoading: state.activeMonthReducer.isLoading,
        user: state.userReducer.user,
        isUserLoading: state.userReducer.isLoading,
        status: state.statusReducer,
      }),
      {
        fetchUser: fetchUserAction,
        fetchStatus: fetchStatusAction,
        fetchActiveDeclaration: fetchActiveDeclarationAction,
        fetchActiveMonth: fetchActiveMonthAction,
        hideDeclarationTransmittedDialog: hideDeclarationTransmittedDialogAction,
      },
    )(App),
  ),
)
