import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { cloneDeep, isBoolean, isNaN as _isNaN, pick } from 'lodash'
import moment from 'moment'
import { PropTypes } from 'prop-types'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import EmployerQuestion from '../../components/Actu/EmployerQuestion'
import CustomColorButton from '../../components/Generic/CustomColorButton'
import WorkSummary from '../../components/Actu/WorkSummary'
import DeclarationDialog from '../../components/Actu/DeclarationDialog'

const StyledEmployers = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 4rem; /* space for position:fixed div */
`

const Title = styled(Typography)`
  text-align: center;
  padding-bottom: 1.5rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const AddEmployersButtonContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin: 3rem 0;
`

const AddEmployersButton = styled(Button)`
  && {
    min-width: 15rem;
    margin: 0 5rem;
  }
`

const LineDiv = styled.div`
  width: 100%;
  max-width: 16.6rem;
  height: 0.1rem;
  background-color: #e4e4e4;
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  flex-wrap: wrap;
`

const ErrorMessage = styled(Typography).attrs({
  paragraph: true,
  variant: 'body2',
})`
  && {
    color: red;
    text-align: center;
    margin: inherit auto;
    max-width: 70rem;
  }
`

const employerTemplate = {
  employerName: { value: '', error: null },
  workHours: { value: '', error: null },
  salary: { value: '', error: null },
  hasEndedThisMonth: { value: null, error: null },
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

const validateField = ({ name, value }) => {
  let isValid = !!value
  let error = isValid ? null : 'Champ obligatoire'
  let sanitizedValue = value
  if (name === 'employerName') {
    sanitizedValue = value.trim()
  }
  if (name === 'workHours' || name === 'salary') {
    const intValue = parseInt(value, 10)
    isValid = !!value && !_isNaN(intValue)
    sanitizedValue = isValid ? intValue.toString() : value.trim()
    error = isValid ? null : `Merci d'entrer un nombre sans virgule`
  } else if (name === 'hasEndedThisMonth') {
    isValid = isBoolean(value)
    error = isValid ? null : 'Merci de répondre à la question'
  }

  return { error, sanitizedValue }
}

// TODO the whole logic of this component needs to be sanitized
export class Employers extends Component {
  static propTypes = {
    activeMonth: PropTypes.instanceOf(Date).isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    token: PropTypes.string.isRequired,
  }

  state = {
    employers: [{ ...employerTemplate }],
    isLoading: true,
    error: null,
    isDialogOpened: false,
    consistencyErrors: [],
    validationErrors: [],
    isValidating: false,
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

  // onChange - let the user type whatever he wants, show errors
  onChange = ({ index, name, value }) => {
    const { error } = validateField({ index, name, value })

    this.updateValue({ index, name, value, error })
  }

  // onBlur - sanitize user inputs, show errors
  onBlur = ({ index, name, value }) => {
    const { error, sanitizedValue } = validateField({ index, name, value })

    this.updateValue({ index, name, value: sanitizedValue, error })
  }

  updateValue = ({ index, name, value, error }) =>
    this.setState(({ employers: prevEmployers }) => ({
      employers: prevEmployers.map(
        (employer, key) =>
          key === index ? { ...employer, [name]: { value, error } } : employer,
      ),
      error: null,
    }))

  onRemove = (index) =>
    this.setState(({ employers }) => ({
      employers: employers.filter((e, key) => key !== index),
    }))

  onSave = () => {
    superagent
      .post('/api/employers', {
        employers: getEmployersMapFromFormData(this.state.employers),
      })
      .set('CSRF-Token', this.props.token)
      .then(() => this.props.history.push('/thanks?later'))
  }

  onSubmit = ({ ignoreErrors = false } = {}) => {
    this.setState({ isValidating: true })

    return superagent
      .post('/api/employers', {
        employers: getEmployersMapFromFormData(this.state.employers),
        isFinished: true,
        ignoreErrors,
      })
      .set('CSRF-Token', this.props.token)
      .then(() => this.props.history.push('/files'))
      .catch((err) => {
        if (
          err.status === 400 &&
          (err.response.body.consistencyErrors.length ||
            err.response.body.validationErrors.length)
        ) {
          // We handle the error inside the modal
          return this.setState({
            consistencyErrors: err.response.body.consistencyErrors,
            validationErrors: err.response.body.validationErrors,
            isValidating: false,
          })
        }

        // Unhandled error
        window.Raven.captureException(err)
        this.setState({
          error: `Nous sommes désolés, mais une erreur s'est produite. Merci de réessayer ultérieurement.
          Si le problème persiste, merci de contacter l'équipe Zen, et d'effectuer
          en attendant votre actualisation sur Pole-emploi.fr.`,
        })
        this.closeDialog()
      })
  }

  openDialog = () => {
    if (this.state.employers.length === 0) {
      return this.setState({
        error: `Merci d'entrer les informations sur vos employeurs`,
      })
    }

    let isFormValid = true
    const employersFormData = cloneDeep(this.state.employers)

    this.state.employers.forEach((employer, index) =>
      Object.keys(employer).forEach((fieldName) => {
        const { error } = validateField({
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

    this.setState({ isDialogOpened: true })
  }

  closeDialog = () => {
    this.setState({
      consistencyErrors: [],
      validationErrors: [],
      isDialogOpened: false,
      isValidating: false,
    })
  }

  renderEmployerQuestion = (data, index) => (
    <EmployerQuestion
      {...data}
      key={index}
      index={index}
      onChange={this.onChange}
      onBlur={this.onBlur}
      onRemove={this.onRemove}
      activeMonth={this.props.activeMonth}
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
          Pour quels employeurs avez-vous travaillé en{' '}
          {moment(this.props.activeMonth).format('MMMM YYYY')}
          {' '}
          ?
        </Title>
        <Form>
          {employers.map(this.renderEmployerQuestion)}

          <AddEmployersButtonContainer>
            <LineDiv />
            <AddEmployersButton
              variant="outlined"
              color="primary"
              onClick={this.addEmployer}
              size="small"
            >
              + Ajouter un employeur
            </AddEmployersButton>
            <LineDiv />
          </AddEmployersButtonContainer>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonsContainer>
            <CustomColorButton onClick={this.onSave}>
              Enregistrer et finir plus tard
            </CustomColorButton>
            <Button variant="raised" onClick={this.openDialog} color="primary">
              Envoyer mon actualisation
            </Button>
          </ButtonsContainer>

          <WorkSummary employers={employers} />

          <DeclarationDialog
            isLoading={this.state.isValidating}
            isOpened={this.state.isDialogOpened}
            onCancel={this.closeDialog}
            onConfirm={this.onSubmit}
            consistencyErrors={this.state.consistencyErrors}
            validationErrors={this.state.validationErrors}
          />
        </Form>
      </StyledEmployers>
    )
  }
}

export default withRouter(Employers)
