import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Warning from '@material-ui/icons/Warning'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import AdditionalDocumentUpload from '../../components/Actu/AdditionalDocumentUpload'
import EmployerDocumentUpload from '../../components/Actu/EmployerDocumentUpload'

const StyledFiles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 55rem;
  margin: auto;
`

const StyledTitle = styled(Typography)`
  && {
    margin-bottom: 1rem;
  }
`

const StyledSummary = styled.div`
  display: flex;
  justify-content: space-between;
  border: 1px solid #d7d7d7;
  border-radius: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background-color: #fbfbfb;
  margin-bottom: 1rem;
`

const StyledSummaryTypography = styled(Typography)`
  flex: 1 1 33%;
`

const StyledInfo = styled.div`
  display: flex;
  align-items: center;
`

const StyledInfoTypography = styled(Typography)`
  padding-left: 0.5rem;
`

const StyledList = styled(List)`
  && {
    margin-bottom: 1rem;
    width: 100%;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding-top: 1rem;
`

const ErrorMessage = styled(Typography)`
  && {
    color: red;
    text-align: center;
    padding-top: 1rem;
  }
`

const calculateTotal = (employers, field) => {
  const total = employers.reduce(
    (prev, employer) => parseInt(employer[field], 10) + prev,
    0,
  )
  return Number.isNaN(total) || total === 0 ? '—' : total.toString()
}

const additionalDocuments = [
  {
    name: 'trainingDocument',
    fieldToCheck: 'hasTrained',
    label: 'Attestation de formation',
  },
  {
    name: 'sickLeaveDocument',
    fieldToCheck: 'hasSickLeave',
    label: 'Feuille maladie',
  },
  {
    name: 'internshipDocument',
    fieldToCheck: 'hasInternship',
    label: 'Attestation de stage',
  },
  {
    name: 'maternityLeaveDocument',
    fieldToCheck: 'hasMaternityLeave',
    label: 'Attestation de congé maternité',
  },
  {
    name: 'retirementDocument',
    fieldToCheck: 'hasRetirement',
    label: 'Attestation retraite',
  },
  {
    name: 'invalidityDocument',
    fieldToCheck: 'hasInvalidity',
    label: 'Attestation invalidité',
  },
]

export class Files extends Component {
  static propTypes = {
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  }

  state = {
    isLoading: true,
    error: null,
    declaration: null,
    employers: [],
    ...additionalDocuments.reduce(
      (prev, doc) => ({
        [`isLoading${doc.name}`]: false,
        [`${doc.name}Error`]: null,
      }),
      {},
    ),
  }

  componentDidMount() {
    Promise.all([
      superagent.get('/api/employers').then((res) => res.body),
      superagent.get('/api/declarations?last').then((res) => res.body),
    ]).then(([employers, declaration]) =>
      this.setState({ employers, declaration, isLoading: false }),
    )
  }

  submitFile = ({ file, employerId }) => {
    this.setState({
      employers: this.state.employers.map(
        (employer) =>
          employer.id === employerId
            ? { ...employer, isLoading: true }
            : employer,
      ),
    })
    superagent
      .post('/api/employers/files')
      .field('employerId', employerId)
      .attach('employerFile', file)
      .then((res) => res.body)
      .then((updatedEmployer) =>
        this.setState({
          employers: this.state.employers.map(
            (employer) =>
              employer.id === updatedEmployer.id ? updatedEmployer : employer,
          ),
        }),
      )
      .catch(() =>
        this.setState({
          employers: this.state.employers.map(
            (employer) =>
              employer.id === employerId
                ? {
                    ...employer,
                    isLoading: false,
                    error: `Désolé, une erreur s'est produite, Merci de réessayer ultérieurement`,
                  }
                : employer,
          ),
        }),
      )
  }

  submitAdditionalFile = ({ file, name }) => {
    const loadingKey = `isLoading${name}`
    const errorKey = `${name}Error`

    this.setState({
      isLoadingSickLeaveDocument: true,
    })
    superagent
      .post('/api/declarations/files')
      .field('declarationId', this.state.declaration.id)
      .field('name', name)
      .attach('document', file)
      .then((res) => res.body)
      .then((declaration) =>
        this.setState({
          declaration,
          [loadingKey]: false,
        }),
      )
      .catch(() =>
        this.setState({
          [loadingKey]: false,
          [errorKey]: `Désolé, une erreur s'est produite, Merci de réessayer ultérieurement`,
        }),
      )
  }

  onSubmit = () => {
    superagent
      .post('/api/declarations/finish')
      .then((res) => res.body)
      .then(() => this.props.history.push('/thanks'))
      .catch((error) => this.setState({ error }))
  }

  renderAdditionalDocument = (document) => (
    <AdditionalDocumentUpload
      declarationId={this.state.declaration.id}
      label={document.label}
      name={document.name}
      error={this.state[`${document.name}Error`]}
      file={this.state.declaration[document.name]}
      isLoading={this.state[`isLoading${document.name}`]}
      submitFile={({ file }) =>
        this.submitAdditionalFile({ file, name: document.name })
      }
    />
  )

  renderEmployerRow = (employer) => (
    <EmployerDocumentUpload {...employer} submitFile={this.submitFile} />
  )

  render() {
    const { declaration, employers, error, isLoading } = this.state

    if (isLoading) {
      return (
        <StyledFiles>
          <CircularProgress />
        </StyledFiles>
      )
    }

    if (!employers.length) {
      return (
        <StyledFiles>
          Nous n'avons pu trouver les informations de vos employeurs. Merci de
          retourner à l'étape précédente pour les remplir.
        </StyledFiles>
      )
    }

    const neededAdditionalDocuments = additionalDocuments.filter(
      (doc) => !!declaration[doc.fieldToCheck],
    )

    const missingAdditionalDocuments = neededAdditionalDocuments.filter(
      (doc) => !this.state.declaration[doc.name],
    )

    const remainingDocumentsNb =
      employers.reduce((prev, employer) => prev + (employer.file ? 0 : 1), 0) +
      missingAdditionalDocuments.length

    return (
      <StyledFiles>
        <StyledTitle variant="title">
          Envoi des documents du mois de Mai 2018
        </StyledTitle>
        <StyledSummary>
          <StyledSummaryTypography variant="body2">
            <b>Actualisation du mois de mai</b>
          </StyledSummaryTypography>
          <StyledSummaryTypography
            variant="body2"
            style={{ textAlign: 'center' }}
          >
            Heures déclarées : {calculateTotal(employers, 'workHours')}h
          </StyledSummaryTypography>
          <StyledSummaryTypography
            variant="body2"
            style={{ textAlign: 'right' }}
          >
            Salaire brut : {calculateTotal(employers, 'salary')}€
          </StyledSummaryTypography>
        </StyledSummary>

        <StyledInfo>
          {remainingDocumentsNb > 0 && <Warning />}
          <StyledInfoTypography variant="body2">
            {remainingDocumentsNb > 0
              ? `Reste ${remainingDocumentsNb} documents à fournir`
              : 'Les documents sont prêts à être envoyés'}
          </StyledInfoTypography>
        </StyledInfo>
        <StyledList>
          {employers.map(this.renderEmployerRow)}
          {neededAdditionalDocuments.map(this.renderAdditionalDocument)}
        </StyledList>

        <StyledInfo>
          <StyledInfoTypography variant="caption">
            L'envoi final à Pôle Emploi pour procéder à votre actualisation sera
            possible une fois tous les documents ajoutés
          </StyledInfoTypography>
        </StyledInfo>

        {error && (
          <ErrorMessage variant="body2">
            Une erreur s'est produite, merci de réessayer ultérieurement
          </ErrorMessage>
        )}

        <ButtonsContainer>
          <Button variant="raised" component={Link} to="/thanks?later">
            Enregistrer et finir plus tard
          </Button>
          <Button
            variant="raised"
            disabled={remainingDocumentsNb > 0}
            onClick={this.onSubmit}
          >
            Envoyer à Pôle Emploi
          </Button>
        </ButtonsContainer>
      </StyledFiles>
    )
  }
}

export default withRouter(Files)
