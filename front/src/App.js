/* eslint-disable react/no-did-update-set-state */
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'

import { fetchUser as fetchUserAction } from './actions/user'
import { fetchStatus as fetchStatusAction } from './actions/status'
import { fetchActiveDeclaration as fetchActiveDeclarationAction } from './actions/declarations'
import { fetchActiveMonth as fetchActiveMonthAction } from './actions/activeMonth'
import DeclarationAlreadySentDialog from './components/Actu/DeclarationAlreadySentDialog'
import StatusErrorDialog from './components/Actu/StatusErrorDialog'
import UnableToDeclareDialog from './components/Actu/UnableToDeclareDialog'
import PrivateRoute from './components/Generic/PrivateRoute'
import Actu from './pages/actu/Actu'
import Employers from './pages/actu/Employers'
import Files from './pages/actu/Files'
import Thanks from './pages/actu/Thanks'
import { LoggedOut } from './pages/generic/LoggedOut'
import Home from './pages/home/Home'
import Layout from './pages/Layout'
import Signup from './pages/other/Signup'

class App extends Component {
  static propTypes = {
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
      isLoading: PropTypes.bool,
    }),
    isServiceStatusLoading: PropTypes.bool,
    isActiveDeclarationLoading: PropTypes.bool,
    isActiveMonthLoading: PropTypes.bool,
    isUserLoading: PropTypes.bool,
  }

  state = {
    err: null,
    showDeclarationSentOnPEModal: false,
    showUnableToSendDeclarationModal: false,
    hasFinishedInitialLoading: false,
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
        if (!this.props.activeMonth) return this.props.history.replace('/files')

        // Log and handle cases when user can't declare using Zen
        // because he's already declared his situation using PE.fr
        // or we can't get declaration data
        if (
          !get(this.props.activeDeclaration, 'hasFinishedDeclaringEmployers')
        ) {
          // User has no declaration, or it isn't already sent
          if (this.props.user.hasAlreadySentDeclaration) {
            // show modal once, and redirect to /files
            this.props.history.replace('/files')
            this.setState({ showDeclarationSentOnPEModal: true })
            window.Raven.captureException(
              new Error('User has already sent declaration on pe.fr'),
            )
            return
          }
          if (!this.props.user.canSendDeclaration) {
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

        if (this.props.activeDeclaration) {
          if (this.props.activeDeclaration.hasFinishedDeclaringEmployers) {
            return this.props.history.replace('/files')
          }
          return this.props.history.replace('/employers')
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

    if (this.state.err) {
      return (
        <Layout user={user}>
          <Typography>
            Nous sommes désolés, mais une erreur s'est produite. Merci de bien
            vouloir recharger à nouveau cette page. Si cela se reproduit, vous
            pouvez contacter l'équipe Zen.
          </Typography>
        </Layout>
      )
    }

    if (pathname === '/') {
      return (
        <Fragment>
          <Route exact path="/" component={Home} />
          {!status.isLoading && (
            <StatusErrorDialog isOpened={!status.isServiceUp} />
          )}
        </Fragment>
      )
    }

    if (
      isActiveDeclarationLoading ||
      isActiveMonthLoading ||
      !this.state.hasFinishedInitialLoading
    ) {
      return (
        <Layout
          user={user}
          activeDeclaration={activeDeclaration}
          activeMonth={activeMonth}
        >
          <div style={{ margin: '5rem', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        </Layout>
      )
    }

    return (
      <Layout
        user={user}
        activeDeclaration={activeDeclaration}
        activeMonth={activeMonth}
      >
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

        <StatusErrorDialog isOpened={!!this.state.isServiceDown} />
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

export default hot(module)(
  withRouter(
    connect(
      (state) => ({
        isServiceUp: state.statusReducer.isServiceUp,
        isServiceStatusLoading: state.statusReducer.isLoading,
        activeDeclaration: state.declarationsReducer.activeDeclaration,
        isActiveDeclarationLoading:
          state.declarationsReducer.isActiveDeclarationLoading,
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
      },
    )(App),
  ),
)
