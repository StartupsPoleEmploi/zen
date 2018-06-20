import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { Link, Redirect, Route, Switch, withRouter } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import PrivateRoute from './components/Generic/PrivateRoute'
import { getUser } from './lib/user'
import Actu from './pages/actu/Actu'
import { Employers } from './pages/actu/Employers'
import { Files } from './pages/actu/Files'
import { Thanks } from './pages/actu/Thanks'
import { LoggedOut } from './pages/generic/LoggedOut'
import Home from './pages/home/Home'
import Layout from './pages/Layout'

const steps = ['Déclaration', 'Employeurs', 'Documents']

const stepsNumbers = ['/actu', '/employers', '/files']

const StyledLink = styled(Link)`
  color: #7cdd91;
  text-decoration: none;

  &:visited {
    color: #7cdd91;
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

  state = { activeMonth: null, error: null, isLoading: true, user: null }

  componentDidMount() {
    Promise.all([
      getUser().then((user) => this.setState({ user })),
      superagent
        .get('/api/declarations?last')
        .then((res) => res.body)
        .catch((err) => {
          // 404 are the normal status when no declaration was made.
          if (err.status !== 404) throw err
        }),
      superagent.get('/api/declarationMonths?active').then((res) => res.body),
    ])
      .then(([, declaration, activeMonth]) => {
        // Redirect the user to the last page he hasn't completed
        this.setState({ activeMonth, isLoading: false })
        if (declaration) {
          if (declaration.hasFinishedDeclaringEmployers) {
            return this.props.history.replace('/files')
          }
          return this.props.history.replace('/employers')
        }
        return this.props.history.replace('/')
      })
      .catch((err) => {
        /* No active month > service is unavailable */
        this.setState({ isLoading: false, error: err })
      })
  }

  render() {
    const {
      location: { pathname },
    } = this.props
    const { activeMonth, error, isLoading, user } = this.state
    if (isLoading) return null

    if (pathname === '/') {
      if (!user) return <Home />
      return <Redirect from="/" to="/actu" />
    }

    if (error || !activeMonth) {
      return (
        <Layout user={user}>
          <Typography>
            Désolé, le service est actuellement indisponible, merci de réessayer
            ultérieurement.
          </Typography>
        </Layout>
      )
    }

    const activeStep = stepsNumbers.indexOf(pathname)

    return (
      <Layout user={user}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                {index >= activeStep ? (
                  label
                ) : (
                  <StyledLink to={stepsNumbers[index]}>{label}</StyledLink>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Switch>
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/actu"
            render={(props) => <Actu {...props} activeMonth={activeMonth} />}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/employers"
            render={(props) => (
              <Employers {...props} activeMonth={activeMonth} />
            )}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/files"
            render={(props) => <Files {...props} activeMonth={activeMonth} />}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/thanks"
            render={(props) => <Thanks {...props} />}
          />
          <Route exact path="/loggedOut" component={LoggedOut} />
          <Route render={() => <div>404</div>} />
        </Switch>
      </Layout>
    )
  }
}

export default hot(module)(withRouter(App))
