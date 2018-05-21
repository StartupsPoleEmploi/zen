import { Button, Typography } from '@material-ui/core'
import React, { Component } from 'react'

import { EmployerQuestion } from '../../components/Actu/EmployerQuestion'
import styled from 'styled-components'

const Title = styled(Typography)`
  text-align: center;
  padding-bottom: 1rem;
`

const employerTemplate = {
  employerName: '',
  workHours: '',
  salary: '',
  hasEndedThisMonth: null,
}

export class Employers extends Component {
  static propTypes = {}

  state = {
    employers: [{ ...employerTemplate }],
  }

  addEmployer = () =>
    this.setState(({ employers }) => ({
      employers: employers.concat({ ...employerTemplate }),
    }))

  onEmployerChange = ({ index, ...updatedEmployerData }) =>
    this.setState(({ employers: prevEmployers }) => ({
      employers: prevEmployers.map(
        (employer, key) => (key === index ? updatedEmployerData : employer),
      ),
    }))

  renderEmployerQuestion = (data, index) => (
    <EmployerQuestion
      {...data}
      key={index}
      index={index}
      onChange={this.onEmployerChange}
    />
  )

  render() {
    const { employers } = this.state
    return (
      <div>
        <Title variant="title">
          Pour quels employeurs avez-vous travaillé en Mai 2018 ?
        </Title>
        <form>
          {employers.map(this.renderEmployerQuestion)}
          <Button variant="raised" onClick={this.addEmployer}>
            Ajouter un employeur
          </Button>
        </form>
      </div>
    )
  }
}

export default Employers
