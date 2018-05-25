import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { cloneDeep, isBoolean, pick } from 'lodash'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import { EmployerQuestion } from '../../components/Actu/EmployerQuestion'

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
  employerName: { value: '', error: null },
  workHours: { value: '', error: null },
  salary: { value: '', error: null },
  hasEndedThisMonth: { value: null, error: null },
}

const calculateTotal = (employers, field) => {
  const total = employers.reduce(
    (total, employer) => parseInt(employer[field].value, 10) + total,
    0,
  )
  return isNaN(total) || total === 0 ? '—' : total.toString()
}

const getEmployersMapFromFormData = (employers) =>
  employers.map((employerFormData) =>
    Object.keys(employerFormData).reduce(
      (obj, fieldName) => ({
        ...obj,
        [fieldName]: employerFormData[fieldName].value,
      }),
      {},
    ),
  )

const getFieldError = ({ index, name, value }) => {
  let isValid = !!value
  let error = isValid ? null : 'Champ obligatoire'
  if (name === 'workHours' || name === 'salary') {
    isValid = !!value && !isNaN(value)
    error = isValid ? null : `Merci d'entrer un nombre entier`
  } else if (name === 'hasEndedThisMonth') {
    isValid = isBoolean(value)
    error = isValid ? null : 'Merci de répondre à la question'
  }

  return error
}

// TODO the whole logic of this component needs to be sanitized
export class Employers extends Component {
  static propTypes = {}

  state = {
    employers: [{ ...employerTemplate }],
    isLoading: true,
    error: null,
  }

  componentDidMount() {
    superagent
      .get('/api/employers')
      .then((res) => res.body)
      .then((employers) => {
        if (employers.length === 0) return this.setState({ isLoading: false })

        this.setState({
          isLoading: false,
          employers: employers.map((employer) =>
            Object.keys(
              pick(employer, [
                'employerName',
                'workHours',
                'salary',
                'hasEndedThisMonth',
                'id',
              ]),
            ).reduce(
              (obj, fieldName) => ({
                ...obj,
                [fieldName]: { value: employer[fieldName], error: null },
              }),
              {},
            ),
          ),
        })
      })
  }

  addEmployer = () =>
    this.setState(({ employers }) => ({
      employers: employers.concat({ ...employerTemplate }),
    }))

  onChange = ({ index, name, value }) => {
    const error = getFieldError({ index, name, value })

    this.setState(({ employers: prevEmployers }) => ({
      employers: prevEmployers.map(
        (employer, key) =>
          key === index ? { ...employer, [name]: { value, error } } : employer,
      ),
      error: null,
    }))
  }

  onRemove = (index) =>
    this.setState(({ employers }) => ({
      employers: employers.filter((e, key) => key !== index),
    }))

  onSave = () => {
    superagent
      .post('/api/employers', {
        employers: getEmployersMapFromFormData(this.state.employers),
      })
      .then(() => this.props.history.push('/thanks?later'))
  }

  onSubmit = () => {
    if (this.state.employers.length === 0) {
      return this.setState({
        error: `Merci d'entrer les informations sur vos employeurs`,
      })
    }

    let isFormValid = true
    const employersFormData = cloneDeep(this.state.employers)

    this.state.employers.forEach((employer, index) =>
      Object.keys(employer).forEach((fieldName) => {
        const error = getFieldError({
          index,
          name: fieldName,
          value: employer[fieldName].value,
        })

        if (error) isFormValid = false

        employersFormData[index][fieldName] = {
          value: employer[fieldName].value,
          error,
        }
      }),
    )

    if (!isFormValid) {
      return this.setState({
        employers: employersFormData,
        error: isFormValid
          ? null
          : `Merci de corriger les erreurs du formulaire`,
      })
    }

    superagent
      .post('/api/employers', {
        employers: getEmployersMapFromFormData(this.state.employers),
      })
      .then(() => this.props.history.push('/files'))
  }

  renderEmployerQuestion = (data, index) => (
    <EmployerQuestion
      {...data}
      key={index}
      index={index}
      onChange={this.onChange}
      onRemove={this.onRemove}
    />
  )

  render() {
    const { employers, error, isLoading } = this.state

    if (isLoading) {
      return (
        <StyledEmployers>
          <CircularProgress />
        </StyledEmployers>
      )
    }
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
          <Button variant="raised" onClick={this.onSave}>
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

export default withRouter(Employers)
