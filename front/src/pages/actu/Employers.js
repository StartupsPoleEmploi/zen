import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
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

const StyledDialogContent = styled(DialogContent)`
  && {
  }
`

const StyledDialogTitle = styled(DialogTitle)`
  text-align: center;
`

const StyledDialogActions = styled(DialogActions)`
  && {
    justify-content: space-around;
    padding-bottom: 2rem;
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

  onSubmit = () => {
    this.setState({ isDialogOpened: false })

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

    superagent
      .post('/api/employers', {
        employers: getEmployersMapFromFormData(this.state.employers),
        isFinished: true,
      })
      .set('CSRF-Token', this.props.token)
      .then(() => this.props.history.push('/files'))
      .catch((err) => {
        window.Raven.captureException(err)
        this.setState({
          error: `Une erreur s'est produite, merci de réessayer ultérieurement`,
        })
      })
  }

  openDialog = () => this.setState({ isDialogOpened: true })
  closeDialog = () => this.setState({ isDialogOpened: false })

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

          {error && <Typography variant="body2">{error}</Typography>}

          <ButtonsContainer>
            <CustomColorButton onClick={this.onSave}>
              Enregistrer et finir plus tard
            </CustomColorButton>
            <Button variant="raised" onClick={this.openDialog} color="primary">
              Envoyer mon actualisation
            </Button>
          </ButtonsContainer>

          <WorkSummary employers={employers} />

          <Dialog
            open={this.state.isDialogOpened}
            onClose={this.closeDialog}
            aria-labelledby="ActuDialogContentText"
          >
            <StyledDialogTitle>Envoi de l'actualisation</StyledDialogTitle>
            <StyledDialogContent>
              <DialogContentText id="ActuDialogContentText">
                Votre actualisation va être envoyée à Pôle-Emploi.
                <br />
                Nous vous envoyons un e-mail pour vous le confirmer.
              </DialogContentText>
            </StyledDialogContent>
            <StyledDialogActions>
              <CustomColorButton onClick={this.closeDialog} color="primary">
                Je n'ai pas terminé
              </CustomColorButton>
              <Button
                variant="raised"
                onClick={this.onSubmit}
                color="primary"
                autoFocus
              >
                Je m'actualise
              </Button>
            </StyledDialogActions>
          </Dialog>
        </Form>
      </StyledEmployers>
    )
  }
}

export default withRouter(Employers)
