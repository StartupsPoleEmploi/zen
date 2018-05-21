import { Button, Typography } from '@material-ui/core'
import React, { Component } from 'react'

import { EmployerQuestion } from '../../components/Actu/EmployerQuestion'
import { isBoolean } from 'lodash'
import styled from 'styled-components'

const StyledEmployers = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled(Typography)`
  text-align: center;
  padding-bottom: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1rem;
`

const SummaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #9c9c9c;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
`

const employerTemplate = {
  employerName: { value: '', error: null, pristine: true },
  workHours: { value: '', error: null, pristine: true },
  salary: { value: '', error: null, pristine: true },
  hasEndedThisMonth: { value: null, error: null, pristine: true },
}

const calculateTotal = (employers, field) => {
  const total = employers.reduce(
    (total, employer) => parseInt(employer[field].value, 10) + total,
    0,
  )
  return isNaN(total) || total === 0 ? '—' : total.toString()
}

// TODO the whole logic of this component needs to be sanitized
export class Employers extends Component {
  static propTypes = {}

  state = {
    employers: [{ ...employerTemplate }],
    error: null,
  }

  addEmployer = () =>
    this.setState(({ employers }) => ({
      employers: employers.concat({ ...employerTemplate }),
    }))

  onChange = ({ index, name, value }) => {
    let isValid = !!value
    let error = isValid ? null : 'Champ obligatoire'
    if (name === 'workHours' || name === 'salary') {
      isValid = !!value && !isNaN(value)
      error = isValid ? null : `Merci d'entrer un nombre entier`
    } else if (name === 'hasEndedThisMonth') {
      isValid = isBoolean(value)
      error = isValid ? null : 'Merci de répondre à la question'
    }

    this.setState(({ employers: prevEmployers }) => ({
      employers: prevEmployers.map(
        (employer, key) =>
          key === index ? { ...employer, [name]: { value, error } } : employer,
      ),
      error: null,
    }))
  }

  onSubmit = () => {
    const isFormValid = this.state.employers.some((employer) =>
      Object.keys(employer).some((fieldName) => !!employer[fieldName].error),
    )

    if (!isFormValid) {
      this.state.employers.forEach((employer, index) =>
        Object.keys(employer).forEach((fieldName) =>
          this.onChange({
            index,
            name: fieldName,
            value: employer[fieldName].value,
          }),
        ),
      )
      return this.setState({
        error: 'Merci de corriger les erreurs du formulaire',
      })
    }
  }

  renderEmployerQuestion = (data, index) => (
    <EmployerQuestion
      {...data}
      key={index}
      index={index}
      onChange={this.onChange}
    />
  )

  render() {
    const { employers, error } = this.state
    return (
      <StyledEmployers>
        <Title variant="title">
          Pour quels employeurs avez-vous travaillé en Mai 2018 ?
        </Title>
        <Form>
          {employers.map(this.renderEmployerQuestion)}
          <Button variant="raised" onClick={this.addEmployer}>
            + Ajouter un employeur
          </Button>
        </Form>

        <SummaryContainer>
          <Typography type="body2">
            Heures déclarées : {calculateTotal(employers, 'workHours')}
          </Typography>
          <Typography type="body2">
            Salaire brut déclaré : {calculateTotal(employers, 'salary')} €
          </Typography>
        </SummaryContainer>

        {error && <Typography type="body2">{error}</Typography>}

        <ButtonsContainer>
          <Button variant="raised" disabled>
            Enregistrer et finir plus tard
          </Button>
          <Button variant="raised" onClick={this.onSubmit}>
            Envoyer mon actualisation
          </Button>
        </ButtonsContainer>
      </StyledEmployers>
    )
  }
}

export default Employers
