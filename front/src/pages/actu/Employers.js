import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import withWidth from '@material-ui/core/withWidth'
import Add from '@material-ui/icons/Add'
import {
  isNaN as _isNaN,
  cloneDeep,
  get,
  isBoolean,
  isNull,
  isObject,
  isUndefined,
  pick,
} from 'lodash'
import moment from 'moment'
import { PropTypes } from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import superagent from 'superagent'

import {
  fetchDeclarations as fetchDeclarationsAction,
  postEmployers as postEmployersAction,
} from '../../redux/actions/declarations'
import DeclarationDialogsHandler from '../../components/Actu/DeclarationDialogs/DeclarationDialogsHandler'
import EmployerQuestion from '../../components/Actu/EmployerQuestion'
import LoginAgainDialog from '../../components/Actu/LoginAgainDialog'
import PreviousEmployersDialog from '../../components/Actu/PreviousEmployersDialog'
import WorkSummary from '../../components/Actu/WorkSummary'
import AlwaysVisibleContainer from '../../components/Generic/AlwaysVisibleContainer'
import MainActionButton from '../../components/Generic/MainActionButton'
import {
  intermediaryBreakpoint,
  mobileBreakpoint,
  primaryBlue,
} from '../../constants'
import {
  MAX_SALARY,
  MAX_WORK_HOURS,
  MIN_SALARY,
  MIN_WORK_HOURS,
  SALARY,
  WORK_HOURS,
} from '../../lib/salary'
import { setNoNeedEmployerOnBoarding as setNoNeedEmployerOnBoardingAction } from '../../redux/actions/user'
import EmployerOnBoarding from './EmployerOnBoarding/EmployerOnBoarding'

const StyledEmployers = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 4rem;

  @media (max-width: ${mobileBreakpoint}) {
    padding-bottom: 0;
  }
`

const Title = styled(Typography)`
  && {
    text-align: center;
    padding-bottom: 1.5rem;
    font-weight: bold;
  }
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
    width: 23rem;
    margin: 0 5rem;
    min-height: 5.5rem;
    color: black;

    @media (max-width: ${intermediaryBreakpoint}) {
      margin: 0 3rem;
    }
  }
`

const LineDiv = styled.div`
  width: 100%;
  max-width: 16.6rem;
  height: 0.1rem;
  background-color: #e4e4e4;

  @media (max-width: ${intermediaryBreakpoint}) {
    width: 15%;
  }
`
const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  text-align: center;
  max-width: 40rem;
  margin: 0 auto;
`

const ErrorMessage = styled(Typography).attrs({
  paragraph: true,
})`
  && {
    color: red;
    text-align: center;
    margin: auto;
    margin-bottom: 2rem;
    max-width: 70rem;
  }
`

const StyledAlwaysVisibleContainer = styled(AlwaysVisibleContainer)`
  && {
    @media (max-width: 550px) {
      padding: 2rem 1rem;
    }
  }
`

const StyledMainAction = styled(MainActionButton)`
  && {
    @media (max-width: ${mobileBreakpoint}) {
      width: 17rem;
    }
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

const getFieldError = ({ name, value }) => {
  const isValid = !isNull(value) && !isUndefined(value) && value !== ''
  if (!isValid) return 'Champ obligatoire'

  if (name === WORK_HOURS) {
    if (_isNaN(value)) {
      return `Merci de ne saisir que des chiffres`
    }
    if (value < MIN_WORK_HOURS || value > MAX_WORK_HOURS) {
      return `Merci de corriger le nombre d'heures travaillées`
    }
  }
  if (name === SALARY) {
    if (_isNaN(value)) {
      return `Merci de ne saisir que des chiffres`
    }
    if (value < MIN_SALARY || value > MAX_SALARY) {
      return `Merci de corriger votre salaire`
    }
  }
  if (name === 'hasEndedThisMonth' && !isBoolean(value)) {
    return 'Merci de répondre à la question'
  }
}

// TODO refactor this, repeated almost exactly in WorkSummary
const calculateTotal = (employers, field) => {
  const total = employers.reduce((prev, employer) => {
    const number = parseFloat(
      isObject(employer[field]) ? employer[field].value : employer[field],
    )
    return number + prev
  }, 0)
  return total
}

// TODO the whole logic of this component needs to be sanitized
export class Employers extends Component {
  static propTypes = {
    activeMonth: PropTypes.instanceOf(Date).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      needEmployerOnBoarding: PropTypes.bool.isRequired,
      csrfToken: PropTypes.string.isRequired,
    }),
    width: PropTypes.string,
    declarations: PropTypes.arrayOf(PropTypes.object),
    fetchDeclarations: PropTypes.func.isRequired,
    postEmployers: PropTypes.func.isRequired,
    setNoNeedEmployerOnBoarding: PropTypes.func.isRequired,
  }

  state = {
    employers: [{ ...employerTemplate }],
    previousEmployers: [],
    isLoading: true,
    error: null,
    isDialogOpened: false,
    showPreviousEmployersModal: false,
    consistencyErrors: [],
    validationErrors: [],
    isValidating: false,
    isLoggedOut: false,
  }

  componentDidMount() {
    this.props
      .fetchDeclarations({ limit: 2 })
      .then(() => {
        const [
          currentDeclaration,
          previousDeclaration,
        ] = this.props.declarations

        if (currentDeclaration.hasFinishedDeclaringEmployers) {
          return this.props.history.replace('/files')
        }

        this.setState({ currentDeclaration })

        if (currentDeclaration.employers.length === 0) {
          if (!previousDeclaration) return

          const relevantPreviousEmployers = previousDeclaration.employers.filter(
            (employer) => !employer.hasEndedThisMonth,
          )
          if (relevantPreviousEmployers.length === 0) return

          return this.setState({
            employers: relevantPreviousEmployers.map((employer) => ({
              ...employerTemplate,
              employerName: {
                value: employer.employerName,
                error: null,
              },
            })),
            previousEmployers: relevantPreviousEmployers,
            showPreviousEmployersModal: true,
          })
        }

        this.setState({
          employers: currentDeclaration.employers.map((employer) =>
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
                [fieldName]: {
                  value: employer[fieldName],
                  error: null,
                },
              }),
              {},
            ),
          ),
        })
      })
      .then(() => this.setState({ isLoading: false }))
  }

  componentWillUnmount() {
    // Save at exit, but avoid saving in case where the user is redirected somewhere else
    // So we make sure data was loaded, and curent declaration
    // hasn't been validated for employers,yet
    if (
      !this.state.isLoading &&
      !this.hasSubmittedAndFinished &&
      get(this.state.currentDeclaration, 'hasFinishedDeclaringEmployers') ===
        false
    ) {
      this.onSave()
    }
  }

  addEmployer = () =>
    this.setState(({ employers }) => ({
      employers: employers.concat({ ...employerTemplate }),
    }))

  // onChange - let the user type whatever he wants, show errors
  onChange = ({ index, name, value }) => {
    const error = getFieldError({ name, value })

    this.updateValue({ index, name, value, error })
  }

  updateValue = ({ index, name, value, error }) =>
    this.setState(({ employers: prevEmployers }) => ({
      employers: prevEmployers.map((employer, key) =>
        key === index ? { ...employer, [name]: { value, error } } : employer,
      ),
      error: null,
    }))

  onRemove = (index) =>
    this.setState(({ employers }) => ({
      employers: employers.filter((e, key) => key !== index),
    }))

  onSave = () =>
    this.props.postEmployers({
      employers: getEmployersMapFromFormData(this.state.employers),
    })

  saveAndRedirect = () =>
    this.onSave().then(() => this.props.history.push('/thanks?later'))

  onSubmit = ({ ignoreErrors = false } = {}) => {
    this.setState({ isValidating: true })

    return this.props
      .postEmployers({
        employers: getEmployersMapFromFormData(this.state.employers),
        isFinished: true,
        ignoreErrors,
      })
      .then(() => {
        this.hasSubmittedAndFinished = true // used to cancel cWU actions
        this.props.history.push('/files')
      })
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
          error: `Nous sommes désolés, mais une erreur s'est produite. Merci de réessayer ultérieurement.
          Si le problème persiste, merci de contacter l'équipe Zen, et d'effectuer
          en attendant votre actualisation sur Pole-emploi.fr.`,
        })
        this.closeDialog()
      })
  }

  checkFormValidity = () => {
    if (this.state.employers.length === 0) {
      this.setState({
        error: `Merci d'entrer les informations sur vos employeurs`,
      })
      return false
    }

    let isFormValid = true
    const employersFormData = cloneDeep(this.state.employers)

    this.state.employers.forEach((employer, index) =>
      Object.keys(employer).forEach((fieldName) => {
        const error = getFieldError({
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

    let error = `Merci de corriger les erreurs du formulaire. `

    if (isFormValid) {
      const salaryTotal = calculateTotal(employersFormData, SALARY)

      if (salaryTotal > MAX_SALARY) {
        error += `Vous ne pouvez pas déclarer plus de ${MAX_SALARY}€ total de salaire. `
        isFormValid = false
      }
    }

    if (!isFormValid) {
      this.setState({
        employers: employersFormData,
        error: isFormValid ? null : error,
      })
    }

    return isFormValid
  }

  openDialog = () => {
    const isValid = this.checkFormValidity()
    if (isValid) {
      this.setState({ isDialogOpened: true })
    }
  }

  closeDialog = () => {
    this.setState({
      consistencyErrors: [],
      validationErrors: [],
      isDialogOpened: false,
      isValidating: false,
    })
  }

  onEmployerOnBoardingEnd = () =>
    superagent
      .post('/api/user/disable-need-employer-on-boarding')
      .set('CSRF-Token', this.props.user.csrfToken)
      .then(() => this.props.setNoNeedEmployerOnBoarding())

  closePreviousEmployersModal = () =>
    this.setState({ showPreviousEmployersModal: false })

  renderEmployerQuestion = (data, index) => (
    <EmployerQuestion
      {...data}
      key={index}
      index={index}
      onChange={this.onChange}
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
        <Title variant="h6" component="h1">
          Pour quels employeurs avez-vous travaillé en{' '}
          {moment(this.props.activeMonth).format('MMMM YYYY')} ?
        </Title>

        {this.props.user.needEmployerOnBoarding && (
          <EmployerOnBoarding onFinish={this.onEmployerOnBoardingEnd} />
        )}
        <Form>
          {employers.map(this.renderEmployerQuestion)}

          <AddEmployersButtonContainer>
            <LineDiv />
            <AddEmployersButton
              variant="outlined"
              color="primary"
              onClick={this.addEmployer}
            >
              <Add style={{ marginRight: '1rem', color: primaryBlue }} />
              Ajouter un employeur
            </AddEmployersButton>
            <LineDiv />
          </AddEmployersButtonContainer>

          <StyledAlwaysVisibleContainer
            scrollButtonTopValue="0"
            style={{ marginTop: '2rem', alignSelf: 'stretch' }}
          >
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <WorkSummary employers={employers} />

            <ButtonsContainer>
              <StyledMainAction primary onClick={this.openDialog}>
                Envoyer mon
                <br />
                actualisation
              </StyledMainAction>
              <StyledMainAction primary={false} onClick={this.saveAndRedirect}>
                Enregistrer
                <br />
                et finir plus tard
              </StyledMainAction>
            </ButtonsContainer>
          </StyledAlwaysVisibleContainer>
        </Form>

        <DeclarationDialogsHandler
          isLoading={this.state.isValidating}
          isOpened={this.state.isDialogOpened}
          onCancel={this.closeDialog}
          onConfirm={this.onSubmit}
          declaration={this.state.currentDeclaration}
          employers={this.state.employers}
          consistencyErrors={this.state.consistencyErrors}
          validationErrors={this.state.validationErrors}
        />
        <LoginAgainDialog isOpened={this.state.isLoggedOut} />
        <PreviousEmployersDialog
          isOpened={this.state.showPreviousEmployersModal}
          onCancel={this.closePreviousEmployersModal}
          employers={this.state.previousEmployers}
        />
      </StyledEmployers>
    )
  }
}

export default connect(
  (state) => ({
    declarations: state.declarationsReducer.declarations,
  }),
  {
    fetchDeclarations: fetchDeclarationsAction,
    postEmployers: postEmployersAction,
    setNoNeedEmployerOnBoarding: setNoNeedEmployerOnBoardingAction,
  },
)(withWidth()(Employers))
