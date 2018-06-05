import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { Link, Route, Switch, withRouter } from 'react-router-dom'
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
  color: #3f51b5;
  text-decoration: none;

  &:visited {
    color: #3f51b5;
  }
`

class App extends Component {
  state = { declaration: null, user: null, isLoading: true }

  componentDidMount() {
    Promise.all([
      getUser().then((user) => this.setState({ user })),
      superagent.get('/api/declarations?last').then((res) => res.body),
    ])
      .then(([user, declaration]) => {
        // Redirect the user to the last page he hasn't completed
        this.setState({ isLoading: false })
        if (declaration) {
          if (declaration.hasFinishedDeclaringEmployers) {
            return this.props.history.push('/files')
          }
          return this.props.history.push('/employers')
        }
      })
      .catch(() => {
        /* no declaration or session is normal */
        this.setState({ isLoading: false })
      })
  }

  render() {
    const {
      location: { pathname },
    } = this.props
    const { isLoading, user } = this.state
    if (isLoading) return null

    const activeStep = stepsNumbers.indexOf(pathname)

    return (
      <Layout user={user}>
        {user && (
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
              return (
                <Step key={label}>
                  <StepLabel>
                    {index >= activeStep ? (
                      label
                    ) : (
                      <StyledLink to={stepsNumbers[index]}>{label}</StyledLink>
                    )}
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        )}

        <Switch>
          <Route
            exact
            path="/"
            render={(props) => <Home {...props} user={user} />}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/actu"
            render={(props) => <Actu {...props} />}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/employers"
            render={(props) => <Employers {...props} />}
          />
          <PrivateRoute
            exact
            isLoggedIn={!!user}
            path="/files"
            render={(props) => <Files {...props} />}
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
