import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import Delete from '@material-ui/icons/DeleteOutlined'
import { cloneDeep, get, isNull, pick, set } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import store from 'store2'
import styled from 'styled-components'
import superagent from 'superagent'

import DeclarationDialog from '../../components/Actu/DeclarationDialog'
import DeclarationQuestion from '../../components/Actu/DeclarationQuestion'
import MaternalAssistantCheck from '../../components/Actu/MaternalAssistantCheck'
import DatePicker from '../../components/Generic/DatePicker'
import LoginAgainDialog from '../../components/Actu/LoginAgainDialog'

const USER_GENDER_MALE = 'male'
const MAX_DATE = new Date('2029-12-31T00:00:00.000Z')

const UNHANDLED_ERROR = `Nous sommes désolés, mais une erreur s'est produite. Merci de réessayer ultérieurement.
Si le problème persiste, merci de contacter l'équipe Zen, et d'effectuer
en attendant votre actualisation sur Pole-emploi.fr.`

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

const Title = styled(Typography).attrs({ variant: 'h6' })`
  text-align: center;
`

const ErrorMessage = styled(Typography).attrs({
  paragraph: true,
  variant: 'body1',
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

const AddElementButtonContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
  margin-bottom: -3rem;
`

const AddElementButton = styled(Button).attrs({
  variant: 'outlined',
  color: 'primary',
})`
  && {
    background: #fff;
  }
`

const formFields = [
  'hasWorked',
  'hasTrained',
  'hasInternship',
  'hasSickLeave',
  'hasMaternityLeave',
  'hasRetirement',
  'hasInvalidity',
  'isLookingForJob',
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
    formError: null,
    isLoading: true,
    loadingError: null,
    isDialogOpened: false,
    isValidating: false,
    consistencyErrors: [],
    validationErrors: [],
    isLoggedOut: false,
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
          ...pick(declaration, formFields.concat('id', 'dates')),
          isLoading: false,
        }),
      )
      .catch((err) => {
        if (err.status >= 500) {
          return this.setState({
            isLoading: false,
            loadingError: err,
          })
        }

        return this.setState({
          isLoading: false,
          hasMaternityLeave:
            this.props.user.gender === USER_GENDER_MALE ? false : null,
        })
      })
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
      return this.setState({ formError: error })
    }
    this.setState({ isDialogOpened: true })
  }

  onAnswer = ({ controlName, hasAnsweredYes }) => {
    this.setState({ [controlName]: hasAnsweredYes, formError: null })

    if (controlName === 'hasTrained') {
      this.setState({ isLookingForJob: hasAnsweredYes ? true : null })
    }

    if (controlName === 'hasSickLeave') {
      this.setState({
        dates: {
          ...this.state.dates,
          sickLeaves: hasAnsweredYes
            ? [{ startDate: null, endDate: null }]
            : [],
        },
      })
    }

    if (controlName === 'hasInternship') {
      this.setState({
        dates: {
          ...this.state.dates,
          internships: hasAnsweredYes
            ? [{ startDate: null, endDate: null }]
            : [],
        },
      })
    }
  }

  onSetDate = ({ controlName, date }) => {
    const newState = cloneDeep(this.state)
    set(newState, controlName, date)
    this.setState({ ...newState, formError: null })
  }

  onJobSearchStopMotive = ({ target: { value: jobSearchStopMotive } }) =>
    this.setState({ jobSearchStopMotive, formError: null })

  getFormError = () => {
    const {
      hasWorked,
      hasTrained,
      hasInternship,
      dates,
      hasSickLeave,
      hasMaternityLeave,
      hasRetirement,
      hasInvalidity,
      isLookingForJob,
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

    if (hasInternship) {
      const hasMissingInternshipDates =
        dates.internships.some(
          ({ startDate, endDate }) => !startDate || !endDate,
        ) || !dates.internships.length
      const hasWrongInternshipDates = dates.internships.some(
        ({ startDate, endDate }) => moment(endDate).isBefore(moment(startDate)),
      )

      if (hasMissingInternshipDates) {
        return `Merci d'indiquer toutes vos dates de stage`
      }
      if (hasWrongInternshipDates) {
        return 'Merci de corriger vos dates de stage (le début du stage ne peut être après sa fin)'
      }
    }

    if (hasSickLeave) {
      const hasMissingSickLeaveDates =
        dates.sickLeaves.some(
          ({ startDate, endDate }) => !startDate || !endDate,
        ) || !dates.sickLeaves.length
      const hasWrongSickLeaveDates = dates.sickLeaves.some(
        ({ startDate, endDate }) => moment(endDate).isBefore(moment(startDate)),
      )

      if (hasMissingSickLeaveDates) {
        return `Merci d'indiquer tous vos dates d'arrêt maladie`
      }
      if (hasWrongSickLeaveDates) {
        return `Merci de corriger d'arrêt maladie (le début de l'arrêt ne peut être après sa fin)`
      }
    }

    if (hasMaternityLeave && !get(dates, 'maternityLeave.startDate')) {
      return `Merci d'indiquer votre date de départ en congé maternité`
    }

    if (hasRetirement && !get(dates, 'retirement.startDate')) {
      return `Merci d'indiquer depuis quand vous touchez une pension retraite`
    }

    if (hasInvalidity && !get(dates, 'invalidity.startDate')) {
      return `Merci d'indiquer depuis quand vous touchez une pension d'invalidité`
    }

    if (!isLookingForJob) {
      if (!get(dates, 'jobSearch.endDate')) {
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
      return this.setState({ formError: error })
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
          (get(err, 'response.body.consistencyErrors.length', 0) ||
            get(err, 'response.body.validationErrors.length', 0))
        ) {
          // We handle the error inside the modal
          return this.setState({
            consistencyErrors: err.response.body.consistencyErrors,
            validationErrors: err.response.body.validationErrors,
            isValidating: false,
          })
        }

        // Reporting here to get a metric of how much next error happens
        window.Raven.captureException(err)

        if (err.status === 401 || err.status === 403) {
          this.closeDialog()
          this.setState({ isLoggedOut: true })
          return
        }

        // Unhandled error
        this.setState({
          formError: UNHANDLED_ERROR,
        })
        this.closeDialog()
      })
  }

  setIsMaternalAssistant = () => {
    store.set('isMaternalAssistant', true)
    this.setState({ isMaternalAssistant: true })
  }

  addSickLeave = () =>
    this.setState({
      dates: {
        ...this.state.dates,
        sickLeaves: (this.state.dates.sickLeaves || []).concat({
          startDate: null,
          endDate: null,
        }),
      },
    })

  addInternship = () =>
    this.setState({
      dates: {
        ...this.state.dates,
        internships: (this.state.dates.internships || []).concat({
          startDate: null,
          endDate: null,
        }),
      },
    })

  removeSickLeave = (key) =>
    this.setState({
      ...this.state,
      dates: {
        ...this.state.dates,
        sickLeaves: this.state.dates.sickLeaves.filter(
          (val, index) => key !== index,
        ),
      },
    })

  removeInternship = (key) =>
    this.setState({
      ...this.state,
      dates: {
        ...this.state.dates,
        internships: this.state.dates.internships.filter(
          (val, index) => key !== index,
        ),
      },
    })

  renderDatePickerGroup = (
    { startDate, endDate },
    key,
    type,
    removeCallback,
  ) => {
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
      <div
        key={`${type}-${key}`}
        style={{ display: 'flex', alignItems: 'flex-end' }}
      >
        <DatePicker
          label="Date de début"
          onSelectDate={this.onSetDate}
          minDate={datePickerMinDate}
          maxDate={datePickerMaxDate}
          name={`dates.${type}[${key}].startDate`}
          value={startDate}
        />
        <DatePicker
          label="Date de fin"
          onSelectDate={this.onSetDate}
          minDate={datePickerMinDate}
          maxDate={MAX_DATE}
          // even with a far-away max-date, we want the default
          // focused date to be in the active month
          initialFocusedDate={datePickerMaxDate}
          name={`dates.${type}[${key}].endDate`}
          value={endDate}
        />
        <Button onClick={() => removeCallback(key)}>
          <Delete />
          Supprimer
        </Button>
      </div>
    )
  }

  renderSickLeavesDatePickerGroup = (value, key) =>
    this.renderDatePickerGroup(value, key, 'sickLeaves', this.removeSickLeave)
  renderInternshipsDatePickerGroup = (value, key) =>
    this.renderDatePickerGroup(value, key, 'internships', this.removeInternship)

  render() {
    const {
      formError,
      isMaternalAssistant,
      isLoading,
      loadingError,
      dates = {},
      hasSickLeave,
      hasInternship,
      hasMaternityLeave,
    } = this.state

    const { user } = this.props

    if (isLoading) {
      return (
        <StyledActu>
          <CircularProgress style={{ margin: 'auto' }} />
        </StyledActu>
      )
    }

    if (loadingError) {
      return (
        <StyledActu>
          <Typography>{UNHANDLED_ERROR}</Typography>
        </StyledActu>
      )
    }

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
                {hasInternship && (
                  <Fragment>
                    {(dates.internships || []).map(
                      this.renderInternshipsDatePickerGroup,
                    )}

                    <AddElementButtonContainer>
                      <AddElementButton onClick={this.addInternship}>
                        + Ajouter un stage
                      </AddElementButton>
                    </AddElementButtonContainer>
                  </Fragment>
                )}
              </DeclarationQuestion>
              <DeclarationQuestion
                label={`Avez-vous été en arrêt maladie ${
                  user.gender === USER_GENDER_MALE
                    ? 'ou en congé paternité'
                    : ''
                } ?`}
                name="hasSickLeave"
                value={this.state.hasSickLeave}
                onAnswer={this.onAnswer}
                style={{ paddingTop: hasInternship ? '3rem' : 'initial' }}
              >
                {hasSickLeave && (
                  <Fragment>
                    {(dates.sickLeaves || []).map(
                      this.renderSickLeavesDatePickerGroup,
                    )}
                    <AddElementButtonContainer>
                      <AddElementButton onClick={this.addSickLeave}>
                        + Ajouter un arrêt maladie
                      </AddElementButton>
                    </AddElementButtonContainer>
                  </Fragment>
                )}
              </DeclarationQuestion>
              {user.gender !== USER_GENDER_MALE && (
                <DeclarationQuestion
                  label="Avez-vous été en congé maternité ?"
                  name="hasMaternityLeave"
                  value={hasMaternityLeave}
                  onAnswer={this.onAnswer}
                  style={{ paddingTop: hasSickLeave ? '3rem' : 'initial' }}
                >
                  <DatePicker
                    label="Date de début"
                    onSelectDate={this.onSetDate}
                    minDate={datePickerMinDate}
                    maxDate={datePickerMaxDate}
                    name="dates.maternityLeave.startDate"
                    value={get(dates, 'maternityLeave.startDate', null)}
                  />
                </DeclarationQuestion>
              )}
              <DeclarationQuestion
                label="Percevez-vous une nouvelle pension retraite ?"
                name="hasRetirement"
                value={this.state.hasRetirement}
                onAnswer={this.onAnswer}
                style={{
                  paddingTop:
                    hasSickLeave && !hasMaternityLeave ? '3rem' : 'initial',
                }}
              >
                <DatePicker
                  label="Depuis le"
                  onSelectDate={this.onSetDate}
                  minDate={datePickerMinDate}
                  maxDate={datePickerMaxDate}
                  name="dates.retirement.startDate"
                  value={get(dates, 'retirement.startDate', null)}
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
                  name="dates.invalidity.startDate"
                  value={get(dates, 'invalidity.startDate', null)}
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
                    name="dates.jobSearch.endDate"
                    value={get(dates, 'jobSearch.endDate', null)}
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

          {formError && <ErrorMessage>{formError}</ErrorMessage>}

          <FinalButtonsContainer>
            <Button
              onClick={this.state.hasWorked ? this.onSubmit : this.openDialog}
              variant="contained"
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

        <LoginAgainDialog isOpened={this.state.isLoggedOut} />
      </StyledActu>
    )
  }
}

export default withRouter(Actu)
