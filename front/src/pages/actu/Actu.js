import React, { Component } from 'react'
import styled from 'styled-components'
import { Paper } from '@material-ui/core'
import store from 'store2'

import MaternalAssistantCheck from '../../components/Actu/MaternalAssistantCheck'

export class Actu extends Component {
  static propTypes = {}

  constructor(props) {
    super(props)

    this.state = {
      isMaternalAssistant: store.get('isMaternalAssistant'),
    }
  }

  setIsMaternalAssistant = () => this.setState({ isMaternalAssistant: true })

  render() {
    const { isMaternalAssistant } = this.state
    if (!isMaternalAssistant) {
      return <MaternalAssistantCheck onValidate={this.setIsMaternalAssistant} />
    }

    return (
      <Paper>
        <form>Actualisation form</form>
      </Paper>
    )
  }
}

export default Actu
