/* eslint-disable no-irregular-whitespace */
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import withWidth from '@material-ui/core/withWidth'
import Delete from '@material-ui/icons/DeleteOutlined'
import { cloneDeep, get, isNull, pick, set } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import store from 'store2'
import styled from 'styled-components'
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt'

import { postDeclaration as postDeclarationAction } from '../../redux/actions/declarations'
import DeclarationDialogsHandler from '../../components/Actu/DeclarationDialogs/DeclarationDialogsHandler'
import DeclarationQuestion from '../../components/Actu/DeclarationQuestion'
import LoginAgainDialog from '../../components/Actu/LoginAgainDialog'
import UserJobCheck from '../../components/Actu/UserJobCheck'
import AlwaysVisibleContainer from '../../components/Generic/AlwaysVisibleContainer'
import DatePicker from '../../components/Generic/DatePicker'
import MainActionButton from '../../components/Generic/MainActionButton'
import {
  jobSearchEndMotive,
  muiBreakpoints,
  ActuTypes as types,
} from '../../constants'
import ScrollToButton from '../../components/Generic/ScrollToButton'

const USER_GENDER_MALE = 'male'
const MAX_DATE = new Date('2029-12-31T00:00:00.000Z')

const UNHANDLED_ERROR = `Nous sommes désolés, mais une erreur s'est produite. Merci de réessayer ultérieurement.
Si le problème persiste, merci de contacter l'équipe Zen, et d'effectuer
en attendant votre actualisation sur Pole-emploi.fr.`

const ScrollButtonContainer = styled.div`
  position: fixed;
  bottom: 17rem;
  right: 2rem;
`

const StyledActu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-width: 70rem;
  margin: 0 auto;
`

const StyledPaper = styled(Paper)`
  width: 100%;
  margin: 4rem auto;
`

const Title = styled(Typography).attrs({ variant: 'h6', component: 'h1' })`
  && {
    text-align: center;
    font-weight: bold;
  }
`

const ErrorMessage = styled(Typography).attrs({
  paragraph: true,
  role: 'alert',
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
`

const StyledList = styled(List)`
  && {
    padding: 0;
  }
  & > *:nth-child(2n) {
    /* primary color with 10% opacity */
    background: rgba(0, 101, 219, 0.1);
  }
`

const AddElementButtonContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
  margin-bottom: -3rem;
`

const StyledArrowRightAlt = styled(ArrowRightAlt)`
  margin-left: 1rem;
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

const JOB_CHECK_KEY = 'canUseService'

const getJobCheckFromStore = () => {
  const data = store.get(JOB_CHECK_KEY) || {}
  return {
    shouldAskAgain: data.shouldAskAgain,
    validatedForMonth:
      data.validatedForMonth && new Date(data.validatedForMonth),
  }
}

export class Actu extends Component {
  static propTypes = {
    activeMonth: PropTypes.instanceOf(Date).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      gender: PropTypes.string,
      canSendDeclaration: PropTypes.bool,
    }),
    declaration: PropTypes.object,
    width: PropTypes.string.isRequired,
    postDeclaration: PropTypes.func.isRequired,
  }

  state = {
    [JOB_CHECK_KEY]: getJobCheckFromStore(),
    formError: null,
    isLoading: true,
    isDialogOpened: false,
    isValidating: false,
    isSendingData: false,
    consistencyErrors: [],
    validationErrors: [],
    isLoggedOut: false,
    infos: [],
    ...formFields.reduce((prev, field) => ({ ...prev, [field]: null }), {}),
  }

  componentDidMount() {
    const { declaration, user } = this.props
    if (declaration && declaration.hasFinishedDeclaringEmployers) {
      return this.props.history.replace('/files')
    }

    if (!user.canSendDeclaration) {
      return this.props.history.replace('/dashboard')
    }

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      hasMaternityLeave: user.gender === USER_GENDER_MALE ? false : null,
      // Set active declaration data, prevent declaration data unrelated to this form.
      ...pick(declaration, formFields.concat('id', 'infos')),
      isLoading: false,
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
    const { hasTrained: oldHasTrainedValue } = this.state
    this.setState({ [controlName]: hasAnsweredYes, formError: null })

    if (controlName === 'hasTrained') {
      if (hasAnsweredYes) {
        this.removeDatesOfType(types.JOB_SEARCH)
        this.setState({ isLookingForJob: true })
      } else if (oldHasTrainedValue) {
        this.setState({
          // if "hasTrained" was previously true, state.hasTrained shoud be reset to null
          isLookingForJob: null,
        })
      }
    }

    if (controlName === 'isLookingForJob') {
      if (!hasAnsweredYes) this.addDates(types.JOB_SEARCH)
      else this.removeDatesOfType(types.JOB_SEARCH)
    }

    ;[
      {
        boolName: 'hasInternship',
        type: types.INTERNSHIP,
      },
      {
        boolName: 'hasSickLeave',
        type: types.SICK_LEAVE,
      },
      {
        boolName: 'hasMaternityLeave',
        type: types.MATERNITY_LEAVE,
      },
      {
        boolName: 'hasInvalidity',
        type: types.INVALIDITY,
      },
      {
        boolName: 'hasRetirement',
        type: types.RETIREMENT,
      },
    ].forEach(({ boolName, type }) => {
      if (controlName !== boolName) return
      if (hasAnsweredYes) return this.addDates(type)
      this.removeDatesOfType(type)
    })
  }

  onSetDate = ({ controlName, date }) => {
    const newState = cloneDeep(this.state)
    set(newState, controlName, date)
    this.setState({ ...newState, formError: null })
  }

  onJobSearchStopMotive = ({ target: { value: jobSearchStopMotive } }) =>
    this.setState({ jobSearchStopMotive, formError: null })

  hasAnsweredMainQuestions = () =>
    ![
      this.state.hasWorked,
      this.state.hasTrained,
      this.state.hasInternship,
      this.state.hasSickLeave,
      this.state.hasRetirement,
      this.state.hasInvalidity,
      this.state.isLookingForJob,
    ].some(isNull) &&
    !(
      this.props.user.gender !== USER_GENDER_MALE &&
      isNull(this.state.hasMaternityLeave)
    )

  getFormError = () => {
    const {
      hasInternship,
      infos,
      hasSickLeave,
      hasMaternityLeave,
      hasRetirement,
      hasInvalidity,
      isLookingForJob,
      jobSearchStopMotive,
    } = this.state
    if (!this.hasAnsweredMainQuestions()) {
      return 'Merci de répondre à toutes les questions'
    }

    if (hasInternship) {
      const internshipDates = infos.filter(
        ({ type }) => type === types.INTERNSHIP,
      )
      const hasMissingInternshipDates =
        internshipDates.some(
          ({ startDate, endDate }) => !startDate || !endDate,
        ) || !internshipDates.length
      const hasWrongInternshipDates = internshipDates.some(
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
      const sickLeaveDates = infos.filter(
        ({ type }) => type === types.SICK_LEAVE,
      )
      const hasMissingSickLeaveDates =
        sickLeaveDates.some(
          ({ startDate, endDate }) => !startDate || !endDate,
        ) || !sickLeaveDates.length
      const hasWrongSickLeaveDates = sickLeaveDates.some(
        ({ startDate, endDate }) => moment(endDate).isBefore(moment(startDate)),
      )

      if (hasMissingSickLeaveDates) {
        return `Merci d'indiquer tous vos dates d'arrêt maladie`
      }
      if (hasWrongSickLeaveDates) {
        return `Merci de corriger vos dates d'arrêt maladie (le début de l'arrêt ne peut être après sa fin)`
      }
    }

    if (
      hasMaternityLeave &&
      !infos.some(
        ({ type, startDate }) => type === types.MATERNITY_LEAVE && startDate,
      )
    ) {
      return `Merci d'indiquer votre date de départ en congé maternité`
    }

    if (
      hasRetirement &&
      !infos.some(
        ({ type, startDate }) => type === types.RETIREMENT && startDate,
      )
    ) {
      return `Merci d'indiquer depuis quand vous touchez une pension retraite`
    }

    if (
      hasInvalidity &&
      !infos.some(
        ({ type, startDate }) => type === types.INVALIDITY && startDate,
      )
    ) {
      return `Merci d'indiquer depuis quand vous touchez une pension d'invalidité`
    }

    if (!isLookingForJob) {
      if (
        !infos.some(({ type, endDate }) => type === types.JOB_SEARCH && endDate)
      ) {
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

    return this.props
      .postDeclaration({ ...this.state, ignoreErrors })
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

  setJobCheck = ({ shouldAskAgain } = {}) => {
    const jobCheckObject = {
      [JOB_CHECK_KEY]: {
        validatedForMonth: this.props.activeMonth,
        shouldAskAgain,
      },
    }

    store.setAll(jobCheckObject)
    this.setState(jobCheckObject)
  }

  // display job check if not validated for current month and should ask again (default)
  shouldDisplayJobCheck = () => {
    const lastMonthValidated = get(
      this.state[JOB_CHECK_KEY],
      'validatedForMonth',
    )
    if (!lastMonthValidated) return true
    return (
      !moment(lastMonthValidated).isSame(this.props.activeMonth, 'month') &&
      get(this.state[JOB_CHECK_KEY], 'shouldAskAgain', true)
    )
  }

  addDates = (type) =>
    this.setState((prevState) => ({
      infos: prevState.infos.concat({
        type,
        startDate: null,
        endDate: null,
      }),
    }))

  removeDates = (key) =>
    this.setState((prevState) => ({
      infos: prevState.infos.filter((value, index) => index !== key),
    }))

  removeDatesOfType = (typeToRemove) =>
    this.setState((prevState) => ({
      infos: prevState.infos.filter(({ type }) => type !== typeToRemove),
    }))

  renderDatePickerGroup = ({
    type,
    showStartDate = true,
    showEndDate = true,
    allowRemove = false,
    startLabel = 'Date de début',
    endLabel = 'Date de fin',
  }) => {
    const activeMonthMoment = moment(this.props.activeMonth)

    const datePickerMinDate = activeMonthMoment
      .clone()
      .startOf('month')
      .toDate()
    const datePickerMaxDate = activeMonthMoment
      .clone()
      .endOf('month')
      .toDate()

    const nodes = []
    this.state.infos.forEach((declarationInfo, key) => {
      if (declarationInfo.type !== type) return

      nodes.push(
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={`${type}-${key}`}
          style={{ display: 'flex', alignItems: 'flex-end' }}
        >
          {showStartDate && (
            <DatePicker
              label={startLabel}
              onSelectDate={this.onSetDate}
              minDate={datePickerMinDate}
              maxDate={datePickerMaxDate}
              name={`infos[${key}].startDate`}
              value={declarationInfo.startDate}
              style={{ paddingRight: '1rem' }}
            />
          )}
          {showEndDate && (
            <DatePicker
              label={endLabel}
              onSelectDate={this.onSetDate}
              minDate={datePickerMinDate}
              maxDate={type !== 'jobSearch' ? MAX_DATE : datePickerMaxDate}
              // even with a far-away max-date, we want the default
              // focused date to be in the active month
              initialFocusedDate={datePickerMaxDate}
              name={`infos[${key}].endDate`}
              value={declarationInfo.endDate}
            />
          )}
          {allowRemove && (
            <Button
              onClick={() => this.removeDates(key)}
              style={{
                // TODO find a better fix. This i a workaround
                // to avoid display issues on iPhone 5SE-size screens
                minWidth: '5.6rem',
              }}
            >
              <Delete aria-label="Supprimer" />
            </Button>
          )}
        </div>,
      )
    })
    return nodes
  }

  render() {
    const {
      formError,
      isLoading,
      hasSickLeave,
      hasInternship,
      hasMaternityLeave,
      isValidating,
    } = this.state

    const { user } = this.props

    if (isLoading) {
      return null
    }

    if (this.shouldDisplayJobCheck()) {
      return <UserJobCheck onValidate={this.setJobCheck} />
    }

    const activeMonthMoment = moment(this.props.activeMonth)

    const useVerticalLayoutForQuestions = this.props.width === muiBreakpoints.xs

    return (
      <StyledActu>
        <Title>
          Déclarer ma situation de {activeMonthMoment.format('MMMM')}
        </Title>

        <form>
          <StyledPaper>
            <StyledList>
              <DeclarationQuestion
                verticalLayout={useVerticalLayoutForQuestions}
                label="Avez-vous travaillé ?"
                name="hasWorked"
                value={this.state.hasWorked}
                onAnswer={this.onAnswer}
              />
              <DeclarationQuestion
                verticalLayout={useVerticalLayoutForQuestions}
                label="Avez-vous été en formation ?"
                name="hasTrained"
                value={this.state.hasTrained}
                onAnswer={this.onAnswer}
              />
              <DeclarationQuestion
                verticalLayout={useVerticalLayoutForQuestions}
                label="Avez-vous été en stage ?"
                name="hasInternship"
                value={this.state.hasInternship}
                onAnswer={this.onAnswer}
              >
                {hasInternship && (
                  <Fragment>
                    {this.renderDatePickerGroup({
                      type: types.INTERNSHIP,
                      allowRemove: true,
                    })}
                    <AddElementButtonContainer>
                      <AddElementButton
                        onClick={() => this.addDates(types.INTERNSHIP)}
                      >
                        + Ajouter un stage
                      </AddElementButton>
                    </AddElementButtonContainer>
                  </Fragment>
                )}
              </DeclarationQuestion>
              <DeclarationQuestion
                verticalLayout={useVerticalLayoutForQuestions}
                label={`Avez-vous été en arrêt maladie${
                  user.gender === USER_GENDER_MALE
                    ? ' ou en congé paternité'
                    : ''
                } ?`}
                name="hasSickLeave"
                value={this.state.hasSickLeave}
                onAnswer={this.onAnswer}
                style={{ paddingTop: hasInternship ? '3rem' : '1rem' }}
              >
                {hasSickLeave && (
                  <Fragment>
                    {this.renderDatePickerGroup({
                      type: types.SICK_LEAVE,
                      allowRemove: true,
                    })}
                    <AddElementButtonContainer>
                      <AddElementButton
                        onClick={() => this.addDates(types.SICK_LEAVE)}
                      >
                        + Ajouter un arrêt maladie
                      </AddElementButton>
                    </AddElementButtonContainer>
                  </Fragment>
                )}
              </DeclarationQuestion>
              {user.gender !== USER_GENDER_MALE && (
                <DeclarationQuestion
                  verticalLayout={useVerticalLayoutForQuestions}
                  label="Avez-vous été en congé maternité ?"
                  name="hasMaternityLeave"
                  value={hasMaternityLeave}
                  onAnswer={this.onAnswer}
                  style={{ paddingTop: hasSickLeave ? '3rem' : '1rem' }}
                >
                  {this.renderDatePickerGroup({
                    type: types.MATERNITY_LEAVE,
                    showEndDate: false,
                  })}
                </DeclarationQuestion>
              )}
              <DeclarationQuestion
                verticalLayout={useVerticalLayoutForQuestions}
                label="Percevez-vous une nouvelle pension retraite ?"
                name="hasRetirement"
                value={this.state.hasRetirement}
                onAnswer={this.onAnswer}
                style={{
                  // accounts for the fact that the section maternityLeave will be absent
                  // for males, and add padding if there was a "add sick leave" button
                  paddingTop:
                    hasSickLeave && user.gender === USER_GENDER_MALE
                      ? '3rem'
                      : '1rem',
                }}
              >
                {this.renderDatePickerGroup({
                  type: types.RETIREMENT,
                  showEndDate: false,
                  startLabel: 'Depuis le',
                })}
              </DeclarationQuestion>
              <DeclarationQuestion
                verticalLayout={useVerticalLayoutForQuestions}
                label="Percevez-vous une nouvelle pension d'invalidité de 2eme ou 3eme catégorie ?"
                name="hasInvalidity"
                value={this.state.hasInvalidity}
                onAnswer={this.onAnswer}
              >
                {this.renderDatePickerGroup({
                  type: types.INVALIDITY,
                  showEndDate: false,
                  startLabel: 'Depuis le',
                })}
              </DeclarationQuestion>
            </StyledList>
          </StyledPaper>

          {!this.state.hasTrained && (
            <StyledPaper>
              <List>
                <DeclarationQuestion
                  verticalLayout={useVerticalLayoutForQuestions}
                  label="Souhaitez-vous rester inscrit à Pôle emploi ?"
                  name="isLookingForJob"
                  value={this.state.isLookingForJob}
                  onAnswer={this.onAnswer}
                  withChildrenOnNo
                >
                  {this.renderDatePickerGroup({
                    type: types.JOB_SEARCH,
                    showStartDate: false,
                    endLabel: 'Date de fin de recherche',
                  })}
                  <RadioGroup
                    row
                    aria-label="motif d'arrêt de recherche d'emploi"
                    name="search"
                    value={this.state.jobSearchStopMotive}
                    onChange={this.onJobSearchStopMotive}
                    style={{ marginTop: '1rem' }}
                  >
                    <FormControlLabel
                      value={jobSearchEndMotive.WORK}
                      control={<Radio color="primary" />}
                      label="Reprise du travail"
                    />
                    <FormControlLabel
                      value={jobSearchEndMotive.RETIREMENT}
                      control={<Radio color="primary" />}
                      label="Retraite"
                    />
                    <FormControlLabel
                      value={jobSearchEndMotive.OTHER}
                      control={<Radio color="primary" />}
                      label="Autre"
                    />
                  </RadioGroup>
                </DeclarationQuestion>
              </List>
            </StyledPaper>
          )}

          <AlwaysVisibleContainer>
            {formError && <ErrorMessage>{formError}</ErrorMessage>}
            <FinalButtonsContainer>
              <MainActionButton
                primary
                onClick={this.state.hasWorked ? this.onSubmit : this.openDialog}
                disabled={!this.hasAnsweredMainQuestions() || isValidating}
              >
                Suivant
                <StyledArrowRightAlt />
              </MainActionButton>
            </FinalButtonsContainer>
          </AlwaysVisibleContainer>
        </form>

        {!this.getFormError() && (
          // Note: only open this dialog if there is no form error (eg. the declaration can be sent)
          <DeclarationDialogsHandler
            isLoading={isValidating}
            isOpened={this.state.isDialogOpened}
            onCancel={this.closeDialog}
            onConfirm={this.onSubmit}
            consistencyErrors={this.state.consistencyErrors}
            validationErrors={this.state.validationErrors}
            declaration={this.state}
          />
        )}

        {this.props.width === muiBreakpoints.xs && (
          <ScrollButtonContainer>
            <ScrollToButton autoRemove />
          </ScrollButtonContainer>
        )}
        <LoginAgainDialog isOpened={this.state.isLoggedOut} />
      </StyledActu>
    )
  }
}

export default connect(null, { postDeclaration: postDeclarationAction })(
  withWidth()(Actu),
)
