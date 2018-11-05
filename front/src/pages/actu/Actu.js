import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import { isNull, pick } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import store from 'store2'
import styled from 'styled-components'
import superagent from 'superagent'

import DeclarationDialog from '../../components/Actu/DeclarationDialog'
import DeclarationQuestion from '../../components/Actu/DeclarationQuestion'
import MaternalAssistantCheck from '../../components/Actu/MaternalAssistantCheck'
import DatePicker from '../../components/Generic/DatePicker'

const USER_GENDER_MALE = 'male'

const StyledActu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-width: 70rem;
  margin: 0 auto;
`

const StyledPaper = styled(Paper)`
  width: 100%;
  margin: 4rem auto 0;
`

const Title = styled(Typography).attrs({ variant: 'title' })`
  text-align: center;
`

const ErrorMessage = styled(Typography).attrs({
  paragraph: true,
  variant: 'body2',
})`
  && {
    color: red;
    text-align: center;
    padding-top: 1.5rem;
  }
`

const FinalButtonsContainer = styled.div`
  margin: auto;
  max-width: 32rem;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding-top: 1.5rem;
`

const StyledList = styled(List)`
  && {
    padding: 0;
  }
  & > *:nth-child(2n) {
    background: #e7ebf2;
  }
`

const formFields = [
  'hasWorked',
  'hasTrained',
  'hasInternship',
  'internshipStartDate',
  'internshipEndDate',
  'hasSickLeave',
  'sickLeaveStartDate',
  'sickLeaveEndDate',
  'hasMaternityLeave',
  'maternityLeaveStartDate',
  'hasRetirement',
  'retirementStartDate',
  'hasInvalidity',
  'invalidityStartDate',
  'isLookingForJob',
  'jobSearchEndDate',
  'jobSearchStopMotive',
]

export class Actu extends Component {
  static propTypes = {
    activeMonth: PropTypes.instanceOf(Date).isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    user: PropTypes.shape({
      gender: PropTypes.string,
      csrfToken: PropTypes.string.isRequired,
    }),
  }

  state = {
    isMaternalAssistant: store.get('isMaternalAssistant'),
    errorMessage: null,
    isLoading: true,
    isDialogOpened: false,
    isValidating: false,
    consistencyErrors: [],
    validationErrors: [],
    ...formFields.reduce((prev, field) => ({ ...prev, [field]: null }), {}),
  }

  componentDidMount() {
    superagent
      .get('/api/declarations?active')
      .then((res) => res.body)
      .then((declaration) =>
        this.setState({
          hasMaternityLeave:
            this.props.user.gender === USER_GENDER_MALE ? false : null,
          // Set active declaration data, prevent declaration data unrelated to this form.
          ...pick(declaration, formFields.concat('id')),
          isLoading: false,
        }),
      )
      .catch(() =>
        this.setState({
          isLoading: false,
          hasMaternityLeave:
            this.props.user.gender === USER_GENDER_MALE ? false : null,
        }),
      )
  }

  closeDialog = () =>
    this.setState({
      consistencyErrors: [],
      validationErrors: [],
      isDialogOpened: false,
      isValidating: false,
    })

  openDialog = () => {
    const error = this.getFormError()
    if (error) {
      return this.setState({ errorMessage: error })
    }
    this.setState({ isDialogOpened: true })
  }

  onAnswer = ({ controlName, hasAnsweredYes }) => {
    this.setState({ [controlName]: hasAnsweredYes, errorMessage: null })

    if (controlName === 'hasTrained' && hasAnsweredYes) {
      this.setState({ isLookingForJob: true })
    }
  }

  onSetDate = ({ controlName, date }) =>
    this.setState({ [controlName]: date, errorMessage: null })

  onJobSearchStopMotive = ({ target: { value: jobSearchStopMotive } }) =>
    this.setState({ jobSearchStopMotive, errorMessage: null })

  getFormError = () => {
    const {
      hasWorked,
      hasTrained,
      hasInternship,
      internshipStartDate,
      internshipEndDate,
      hasSickLeave,
      sickLeaveStartDate,
      sickLeaveEndDate,
      hasMaternityLeave,
      maternityLeaveStartDate,
      hasRetirement,
      retirementStartDate,
      hasInvalidity,
      invalidityStartDate,
      isLookingForJob,
      jobSearchEndDate,
      jobSearchStopMotive,
    } = this.state
    if (
      [
        hasWorked,
        hasTrained,
        hasInternship,
        hasSickLeave,
        hasRetirement,
        hasInvalidity,
        isLookingForJob,
      ].some(isNull)
    ) {
      return 'Merci de répondre à toutes les questions'
    }

    if (hasInternship && (!internshipStartDate || !internshipEndDate)) {
      return `Merci d'indiquer vos dates de stage`
    }

    if (hasSickLeave && (!sickLeaveStartDate || !sickLeaveEndDate)) {
      return `Merci d'indiquer vos dates d'arrêt maladie`
    }

    if (hasMaternityLeave && !maternityLeaveStartDate) {
      return `Merci d'indiquer votre date de départ en congé maternité`
    }

    if (hasRetirement && !retirementStartDate) {
      return `Merci d'indiquer depuis quand vous touchez une pension retraite`
    }

    if (hasInvalidity && !invalidityStartDate) {
      return `Merci d'indiquer depuis quand vous touchez une pension d'invalidité`
    }

    if (!isLookingForJob) {
      if (!jobSearchEndDate) {
        return `Merci d'indiquer depuis quand vous ne cherchez plus d'emploi`
      }

      if (!jobSearchStopMotive) {
        return `Merci d'indiquer pourquoi vous ne recherchez plus d'emploi`
      }
    }
  }

  onSubmit = ({ ignoreErrors = false } = {}) => {
    const error = this.getFormError()
    if (error) {
      return this.setState({ errorMessage: error })
    }

    this.setState({ isValidating: true })

    return superagent
      .post('/api/declarations', { ...this.state, ignoreErrors })
      .set('CSRF-Token', this.props.user.csrfToken)
      .then(() =>
        this.props.history.push(this.state.hasWorked ? '/employers' : '/files'),
      )
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
          errorMessage: `Nous sommes désolés, mais une erreur s'est produite. Merci de réessayer ultérieurement.
            Si le problème persiste, merci de contacter l'équipe Zen, et d'effectuer
            en attendant votre actualisation sur Pole-emploi.fr.`,
        })
        this.closeDialog()
      })
  }

  setIsMaternalAssistant = () => {
    store.set('isMaternalAssistant', true)
    this.setState({ isMaternalAssistant: true })
  }

  render() {
    const { errorMessage, isMaternalAssistant, isLoading } = this.state

    if (isLoading)
      return (
        <StyledActu>
          <CircularProgress />
        </StyledActu>
      )

    if (!isMaternalAssistant) {
      return <MaternalAssistantCheck onValidate={this.setIsMaternalAssistant} />
    }

    const activeMonthMoment = moment(this.props.activeMonth)

    const datePickerMinDate = activeMonthMoment
      .clone()
      .startOf('month')
      .toDate()
    const datePickerMaxDate = activeMonthMoment
      .clone()
      .endOf('month')
      .toDate()

    return (
      <StyledActu>
        <Title>
          Déclarer ma situation de {activeMonthMoment.format('MMMM')}
        </Title>

        <form>
          <StyledPaper>
            <StyledList>
              <DeclarationQuestion
                label="Avez-vous travaillé ?"
                name="hasWorked"
                value={this.state.hasWorked}
                onAnswer={this.onAnswer}
              />
              <DeclarationQuestion
                label="Avez-vous été en formation ?"
                name="hasTrained"
                value={this.state.hasTrained}
                onAnswer={this.onAnswer}
              />
              <DeclarationQuestion
                label="Avez-vous été en stage ?"
                name="hasInternship"
                value={this.state.hasInternship}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Date de début"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="internshipStartDate"
                  value={this.state.internshipStartDate}
                />
                <DatePicker
                  label="Date de fin"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="internshipEndDate"
                  value={this.state.internshipEndDate}
                />
              </DeclarationQuestion>
              <DeclarationQuestion
                label="Avez-vous été en arrêt maladie ?"
                name="hasSickLeave"
                value={this.state.hasSickLeave}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Date de début"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="sickLeaveStartDate"
                  value={this.state.sickLeaveStartDate}
                />
                <DatePicker
                  label="Date de fin"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="sickLeaveEndDate"
                  value={this.state.sickLeaveEndDate}
                />
              </DeclarationQuestion>
              {this.props.user.gender !== USER_GENDER_MALE && (
                <DeclarationQuestion
                  label="Avez-vous été en congé maternité ?"
                  name="hasMaternityLeave"
                  value={this.state.hasMaternityLeave}
                  onAnswer={this.onAnswer}
                >
                  <DatePicker
                    label="Date de début"
                    onSelectDate={this.onSetDate}
                    minDate={datePickerMinDate}
                    maxDate={datePickerMaxDate}
                    name="maternityLeaveStartDate"
                    value={this.state.maternityLeaveStartDate}
                  />
                </DeclarationQuestion>
              )}
              <DeclarationQuestion
                label="Percevez-vous une nouvelle pension retraite ?"
                name="hasRetirement"
                value={this.state.hasRetirement}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Depuis le"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="retirementStartDate"
                  value={this.state.retirementStartDate}
                />
              </DeclarationQuestion>
              <DeclarationQuestion
                label="Percevez-vous une nouvelle pension d'invalidité de 2eme ou 3eme catégorie ?"
                name="hasInvalidity"
                value={this.state.hasInvalidity}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Depuis le"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="invalidityStartDate"
                  value={this.state.invalidityStartDate}
                />
              </DeclarationQuestion>
            </StyledList>
          </StyledPaper>

          {!this.state.hasTrained && (
            <StyledPaper>
              <List>
                <DeclarationQuestion
                  label="Souhaitez-vous rester inscrit à Pôle Emploi ?"
                  name="isLookingForJob"
                  value={this.state.isLookingForJob}
                  onAnswer={this.onAnswer}
                  withChildrenOnNo
                >
                  <DatePicker
                    label="Date de fin de recherche"
                    onSelectDate={this.onSetDate}
                    minDate={datePickerMinDate}
                    maxDate={datePickerMaxDate}
                    name="jobSearchEndDate"
                    value={this.state.jobSearchEndDate}
                  />

                  <RadioGroup
                    row
                    aria-label="motif d'arrêt de recherche d'emploi"
                    name="search"
                    value={this.state.jobSearchStopMotive}
                    onChange={this.onJobSearchStopMotive}
                  >
                    <FormControlLabel
                      value="work"
                      control={<Radio color="primary" />}
                      label="Reprise du travail"
                    />
                    <FormControlLabel
                      value="retirement"
                      control={<Radio color="primary" />}
                      label="Retraite"
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio color="primary" />}
                      label="Autre"
                    />
                  </RadioGroup>
                </DeclarationQuestion>
              </List>
            </StyledPaper>
          )}

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

          <FinalButtonsContainer>
            <Button
              onClick={this.state.hasWorked ? this.onSubmit : this.openDialog}
              variant="raised"
              color="primary"
            >
              Suivant
            </Button>
          </FinalButtonsContainer>
        </form>

        <DeclarationDialog
          isLoading={this.state.isValidating}
          isOpened={this.state.isDialogOpened}
          onCancel={this.closeDialog}
          onConfirm={this.onSubmit}
          consistencyErrors={this.state.consistencyErrors}
          validationErrors={this.state.validationErrors}
        />
      </StyledActu>
    )
  }
}

export default withRouter(Actu)
