import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

import PrivateRoute from './components/Generic/PrivateRoute'
import { getUser } from './lib/user'
import Actu from './pages/actu/Actu'
import { Employers } from './pages/actu/Employers'
import Home from './pages/home/Home'
import Layout from './pages/Layout'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = { user: null, isLoading: true }

    getUser()
      .then((user) => this.setState({ user, isLoading: false }))
      .catch((err) => this.setState({ isLoading: false, err }))
  }

  render() {
    const { isLoading, user } = this.state
    if (isLoading) return null

    return (
      <Layout user={user}>
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
          <Route
            exact
            path="/loggedOut"
            render={() => <div>Merci de vous reconnecter</div>}
          />
          <Route render={() => <div>404</div>} />
        </Switch>
      </Layout>
    )
  }
}

export default App
