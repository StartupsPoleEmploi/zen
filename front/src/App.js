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

  state = {
    activeMonth: null,
    err: null,
    isLoading: true,
    lastDeclaration: null,
    user: null,
  }

  componentDidMount() {
    getUser()
      .then((user) => {
        this.setState({ user })
        window.Raven.setUserContext({
          id: user.id,
        })

        if (!user) return this.setState({ isLoading: false })

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
            .get('/api/declarationMonths?active')
            .then((res) => res.body),
        ]).then(([declaration, activeMonthString]) => {
          // Redirect the user to the last page he hasn't completed
          this.setState({
            activeMonth:
              (activeMonthString && new Date(activeMonthString)) || null,
            isLoading: false,
          })
          if (declaration) {
            if (declaration.isFinished) {
              return this.props.history.replace('/thanks')
            }
            if (declaration.hasFinishedDeclaringEmployers) {
              return this.props.history.replace('/files')
            }
            return this.props.history.replace('/employers')
          }
          return this.props.history.replace('/')
        })
      })
      .catch((err) => this.setState({ isLoading: false, err }))
  }

  render() {
    const {
      location: { pathname },
    } = this.props
    const { activeMonth, err, isLoading, lastDeclaration, user } = this.state
    if (isLoading) return null

    if (!user) {
      if (pathname === '/') {
        return <Route exact path="/" component={Home} />
      }
      return <Redirect to="/" />
    }

    if (pathname === '/') return <Redirect from="/" to="/actu" />

    // Deactivate the service if no active month
    // Except if the user's last declaration has files that need sending
    const shouldTakeUserToFilesScreen =
      lastDeclaration &&
      lastDeclaration.hasFinishedDeclaringEmployers &&
      !lastDeclaration.isFinished

    if (!activeMonth && !shouldTakeUserToFilesScreen) {
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

    if (!user.isAuthorizedForTests) {
      return (
        <Layout user={user}>
          <Typography>
            Bonjour, merci de l'intérêt que vous portez au service Zen.
          </Typography>
          <Typography>
            {' '}
            Notre service n'est actuellement ouvert en beta qu'à quelques
            testeurs, merci de réessayer un prochain mois.{' '}
          </Typography>
          <Typography>
            Si vous souhaitez contacter l'équipe, vous pouvez envoyer un message
            à <a href="mailto:zen@pole-emploi.fr">zen@pole-emploi.fr</a>
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

    return (
      <Layout user={user}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                {// Disable navigation back on last step
                index >= activeStep || activeStep >= 2 ? (
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
            render={(props) => <Thanks {...props} activeMonth={activeMonth} />}
          />
          <Route exact path="/loggedOut" component={LoggedOut} />
          <Route render={() => <div>404</div>} />
        </Switch>
      </Layout>
    )
  }
}

export default hot(module)(withRouter(App))
