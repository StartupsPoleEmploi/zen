import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import { isNull } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import store from 'store2'
import styled from 'styled-components'
import superagent from 'superagent'

import DeclarationQuestion from '../../components/Actu/DeclarationQuestion'
import MaternalAssistantCheck from '../../components/Actu/MaternalAssistantCheck'
import DatePicker from '../../components/Generic/DatePicker'

const StyledActu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const StyledPaper = styled(Paper)`
  width: 80rem;
  margin: 1rem auto 0;
`

const ErrorMessage = styled(Typography)`
  && {
    color: red;
    text-align: center;
    padding-top: 1.5rem;
  }
`

const FinalButtonsContainer = styled.div`
  margin: auto;
  width: 32rem;
  display: flex;
  justify-content: space-around;
  padding-top: 3rem;
`

export class Actu extends Component {
  static propTypes = {
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  }

  state = {
    isMaternalAssistant: store.get('isMaternalAssistant'),
    hasWorked: null,
    hasTrained: null,
    trainingStartDate: null,
    trainingEndDate: null,
    hasInternship: null,
    internshipStartDate: null,
    internshipEndDate: null,
    hasSickLeave: null,
    sickLeaveStartDate: null,
    sickLeaveEndDate: null,
    hasMaternityLeave: null,
    maternityLeaveStartDate: null,
    hasRetirement: null,
    retirementStartDate: null,
    hasInvalidity: null,
    invalidityStartDate: null,
    isLookingForJob: null,
    jobSearchEndDate: null,
    jobSearchStopMotive: null,
    errorMessage: null,
    isLoading: true,
  }

  componentDidMount() {
    superagent
      .get('/api/declarations?last')
      .then((res) => res.body)
      .then((declaration) =>
        this.setState({ ...declaration, isLoading: false }),
      )
      .catch(() => this.setState({ isLoading: false }))
  }

  onAnswer = ({ controlName, hasAnsweredYes }) =>
    this.setState({ [controlName]: hasAnsweredYes, errorMessage: null })

  onSetDate = ({ controlName, date }) =>
    this.setState({ [controlName]: date, errorMessage: null })

  onJobSearchStopMotive = ({ target: { value: jobSearchStopMotive } }) =>
    this.setState({ jobSearchStopMotive, errorMessage: null })

  onSubmit = () => {
    const {
      hasWorked,
      hasTrained,
      trainingStartDate,
      trainingEndDate,
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
      return this.setState({
        errorMessage: 'Merci de répondre à toutes les questions',
      })
    }

    if (hasTrained && (!trainingStartDate || !trainingEndDate)) {
      return this.setState({
        errorMessage: "Merci d'indiquer vos dates de formation",
      })
    }

    if (hasInternship && (!internshipStartDate || !internshipEndDate)) {
      return this.setState({
        errorMessage: "Merci d'indiquer vos dates de stage",
      })
    }

    if (hasSickLeave && (!sickLeaveStartDate || !sickLeaveEndDate)) {
      return this.setState({
        errorMessage: "Merci d'indiquer vos dates d'arrêt maladie",
      })
    }

    if (hasMaternityLeave && !maternityLeaveStartDate) {
      return this.setState({
        errorMessage:
          "Merci d'indiquer votre date de départ en congé maternité",
      })
    }

    if (hasRetirement && !retirementStartDate) {
      return this.setState({
        errorMessage:
          "Merci d'indiquer depuis quand vous touchez une pension retraite",
      })
    }

    if (hasInvalidity && !invalidityStartDate) {
      return this.setState({
        errorMessage:
          "Merci d'indiquer depuis quand vous touchez une pension d'invalidité",
      })
    }

    if (!isLookingForJob) {
      if (!jobSearchEndDate) {
        return this.setState({
          errorMessage:
            "Merci d'indiquer depuis quand vous ne cherchez plus d'emploi",
        })
      }

      if (!jobSearchStopMotive) {
        return this.setState({
          errorMessage:
            "Merci d'indiquer pourquoi vous ne recherchez plus d'emploi",
        })
      }
    }

    superagent
      .post('/api/declarations', this.state)
      .then(() => this.props.history.push('/employers'))
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

    return (
      <StyledActu>
        <Typography variant="title">Déclarer ma situation de mai</Typography>
        <form>
          <StyledPaper>
            <List>
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
              >
                <DatePicker
                  label="Date de début"
                  onSelectDate={this.onSetDate}
                  name="trainingStartDate"
                  value={this.state.trainingStartDate}
                />
                <DatePicker
                  label="Date de fin"
                  onSelectDate={this.onSetDate}
                  name="trainingEndDate"
                  value={this.state.trainingEndDate}
                />
              </DeclarationQuestion>
              <DeclarationQuestion
                label="Avez-vous été en stage ?"
                name="hasInternship"
                value={this.state.hasInternship}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Date de début"
                  onSelectDate={this.onSetDate}
                  name="internshipStartDate"
                  value={this.state.internshipStartDate}
                />
                <DatePicker
                  label="Date de fin"
                  onSelectDate={this.onSetDate}
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
                  name="sickLeaveStartDate"
                  value={this.state.sickLeaveStartDate}
                />
                <DatePicker
                  label="Date de fin"
                  onSelectDate={this.onSetDate}
                  name="sickLeaveEndDate"
                  value={this.state.sickLeaveEndDate}
                />
              </DeclarationQuestion>
              <DeclarationQuestion
                label="Avez-vous été en congé maternité ?"
                name="hasMaternityLeave"
                value={this.state.hasMaternityLeave}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Date de début"
                  onSelectDate={this.onSetDate}
                  name="maternityLeaveStartDate"
                  value={this.state.maternityLeaveStartDate}
                />
              </DeclarationQuestion>
              <DeclarationQuestion
                label="Percevez-vous une nouvelle pension retraite ?"
                name="hasRetirement"
                value={this.state.hasRetirement}
                onAnswer={this.onAnswer}
              >
                <DatePicker
                  label="Depuis le"
                  onSelectDate={this.onSetDate}
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
                  name="invalidityStartDate"
                  value={this.state.invalidityStartDate}
                />
              </DeclarationQuestion>
            </List>
          </StyledPaper>

          <StyledPaper>
            <List>
              <DeclarationQuestion
                label="Souhaitez-vous rester inscrit à Pôle Emploi ?"
                name="isLookingForJob"
                value={this.state.isLookingForJob}
                onAnswer={this.onAnswer}
                withChildrenOnNo
              >
                <DatePicker
                  label="Date de fin de recherche"
                  onSelectDate={this.onSetDate}
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

          {errorMessage && (
            <ErrorMessage variant="body2">{errorMessage}</ErrorMessage>
          )}

          <FinalButtonsContainer>
            <Button onClick={this.onSubmit} variant="raised">
              Suivant
            </Button>
          </FinalButtonsContainer>
        </form>
      </StyledActu>
    )
  }
}

export default withRouter(Actu)
