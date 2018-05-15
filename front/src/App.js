import React, { Component } from 'react'
import Home from './pages/home/Home'

import { getUser } from './lib/user'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = { user: null, isLoading: true }

    getUser()
      .then((user) => this.setState({ user, isLoading: false }))
      .catch((err) => this.setState({ isLoading: false, err }))
  }

  render() {
    if (this.state.isLoading) return null

    return <Home user={this.state.user} />
  }
}

export default App
