import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import { cloneDeep, get, sortBy } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import AdditionalDocumentUpload from '../../components/Actu/AdditionalDocumentUpload'
import EmployerDocumentUpload from '../../components/Actu/EmployerDocumentUpload'
import WorkSummary from '../../components/Actu/WorkSummary'
import CustomColorButton from '../../components/Generic/CustomColorButton'

const StyledFiles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 88rem;
  width: 100%;
  margin: auto;
  padding-bottom: 4rem; /* space for position:fixed div */
`

const StyledTitle = styled(Typography)`
  && {
    margin-bottom: 1.5rem;
  }
`

const StyledInfo = styled.div`
  text-align: center;
`

const StyledList = styled(List)`
  && {
    margin-bottom: 1.5rem;
    width: 100%;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 2.5rem;
`

const ErrorMessage = styled(Typography)`
  && {
    color: red;
    text-align: center;
    padding-top: 1.5rem;
  }
`

const OtherDocumentsContainer = styled.div`
  background-color: #f2f2f2;
  text-align: center;

  /* Overflowing background*/
  padding: 1rem 9999px;
  margin: 0 -9999px;

  margin-top: 2rem;
`

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

const getLoadingKey = ({ name, declarationId }) =>
  `$isLoading-${declarationId}-${name}`
const getErrorKey = ({ name, declarationId }) =>
  `${declarationId}-${name}-Error`

export class Files extends Component {
  static propTypes = {
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  }

  state = {
    isLoading: true,
    error: null,
    showMissingDocs: false,
  }

  componentDidMount() {
    superagent
      .get('/api/declarations?unfinished')
      .then((res) => res.body)
      .then((declarations) =>
        this.setState({
          declarations,
          isLoading: false,
        }),
      )
  }

  displayMissingDocs = () => this.setState({ showMissingDocs: true })

  submitEmployerFile = ({ declarationId, file, employerId }) => {
    const updateEmployer = ({
      declarationId: dId,
      employerId: eId,
      ...dataToSet
    }) => {
      const declarations = cloneDeep(this.state.declarations)
      const declarationIndex = this.state.declarations.findIndex(
        ({ id }) => id === dId,
      )
      declarations[declarationIndex].employers = declarations[
        declarationIndex
      ].employers.map(
        (employer) =>
          employer.id === eId ? { ...employer, ...dataToSet } : employer,
      )

      return this.setState({ declarations })
    }

    updateEmployer({ declarationId, employerId, isLoading: true })

    superagent
      .post('/api/employers/files')
      .field('employerId', employerId)
      .attach('employerFile', file)
      .then((res) => res.body)
      .then((updatedEmployer) =>
        updateEmployer({
          declarationId,
          employerId: updatedEmployer.id,
          isLoading: false,
          error: null,
          ...updatedEmployer,
        }),
      )
      .catch((err) => {
        const errorLabel =
          err.status === 413
            ? 'Erreur : Fichier trop lourd (limite : 5000ko)'
            : err.status === 400
              ? 'Erreur : Fichier invalide (accepté : .png, .jpg, .pdf)'
              : `Désolé, une erreur s'est produite, Merci de réessayer ultérieurement`
        // TODO this should be refined to not send all common errors
        // (file too big, etc)
        window.Raven.captureException(err)
        this.setState({
          employers: this.state.employers.map(
            (employer) =>
              employer.id === employerId
                ? {
                    ...employer,
                    isLoading: false,
                    error: errorLabel,
                  }
                : employer,
          ),
        })
      })
  }

  submitAdditionalFile = ({ declarationId, file, name }) => {
    const errorKey = getErrorKey({
      name,
      declarationId,
    })
    const loadingKey = getLoadingKey({
      name,
      declarationId,
    })

    this.setState({
      [loadingKey]: true,
    })

    superagent
      .post('/api/declarations/files')
      .field('declarationId', declarationId)
      .field('name', name)
      .attach('document', file)
      .then((res) => res.body)
      .then((declaration) => {
        const declarations = cloneDeep(this.state.declarations)
        const declarationIndex = declarations.findIndex(
          ({ id }) => declaration.id === id,
        )
        declarations[declarationIndex] = declaration

        return this.setState({
          declarations,
          [loadingKey]: false,
          [errorKey]: null,
        })
      })
      .catch((err) => {
        const errorLabel =
          err.status === 413
            ? 'Erreur : Fichier trop lourd (limite : 5000ko)'
            : err.status === 400
              ? 'Fichier invalide (accepté : .png, .jpg, .pdf)'
              : `Désolé, une erreur s'est produite, Merci de réessayer ultérieurement`
        // TODO this should be refined to not send all common errors
        // (file too big, etc)
        window.Raven.captureException(err)

        this.setState({
          [loadingKey]: false,
          [errorKey]: errorLabel,
        })
      })
  }

  onSubmit = () => {
    superagent
      .post('/api/declarations/finish', { id: this.state.declaration.id })
      .then((res) => res.body)
      .then(() => this.props.history.push('/thanks'))
      .catch((error) => {
        window.Raven.captureException(error)
        this.setState({ error })
      })
  }

  renderDocumentList = ({ declaration, omitTransmitted, showMonthHeaders }) => {
    // if `omitTransmitted` is true, we won't display already transmitted documents.
    // otherwise, they'll be shown, but won't be replaceable
    const neededAdditionalDocuments = additionalDocuments
      .filter((doc) => !!declaration[doc.fieldToCheck])
      .filter(
        (doc) =>
          omitTransmitted ? !get(declaration[doc.name], 'isTransmitted') : true,
      )

    const documentNodes = sortBy(declaration.employers, 'id')
      .filter(
        (employer) =>
          omitTransmitted ? !get(employer.document, 'isTransmitted') : true,
      )
      .map((employer) =>
        this.renderEmployerRow({
          employer,
          declaration,
          omitTransmitted,
        }),
      )
      .concat(
        neededAdditionalDocuments.map((neededDocument) =>
          this.renderAdditionalDocument({
            label: neededDocument.label,
            name: neededDocument.name,
            declaration,
            omitTransmitted,
          }),
        ),
      )

    // do not display a section if there are no documents to display.
    if (documentNodes.length === 0) return null

    return (
      <Fragment>
        {showMonthHeaders && (
          <Typography variant="title">
            {moment(declaration.declarationMonth.month).format('MMMM YYYY')}
          </Typography>
        )}
        <StyledList>{documentNodes}</StyledList>
      </Fragment>
    )
  }

  renderOlderDocumentsList = (declaration) =>
    this.renderDocumentList({
      declaration,
      omitTransmitted: true,
      showMonthHeaders: true,
    })

  renderCurrentDocumentsList = (declaration) =>
    this.renderDocumentList({
      declaration,
      omitTransmitted: false,
      showMonthHeaders: false,
    })

  renderAdditionalDocument = ({ label, name, declaration }) => (
    <AdditionalDocumentUpload
      key={name}
      declarationId={declaration.id}
      label={label}
      name={name}
      error={
        this.state[
          getErrorKey({
            name,
            declarationId: declaration.id,
          })
        ]
      }
      fileExistsOnServer={!!declaration[name]}
      isLoading={
        this.state[
          getLoadingKey({
            name,
            declarationId: declaration.id,
          })
        ]
      } // FIXME declaration id will now be needed
      submitFile={({ file }) =>
        this.submitAdditionalFile({
          file,
          name,
          declarationId: declaration.id,
        })
      }
      isTransmitted={get(declaration[name], 'isTransmitted')}
    />
  )

  renderEmployerRow = ({ employer, declaration }) => (
    <EmployerDocumentUpload
      key={employer.id}
      {...employer}
      submitFile={(opts) =>
        this.submitEmployerFile({ declarationId: declaration.id, ...opts })
      }
      fileExistsOnServer={!!employer.document}
      isTransmitted={get(employer.document, 'isTransmitted')}
    />
  )

  render() {
    const { declarations, error, isLoading } = this.state

    if (isLoading) {
      return (
        <StyledFiles>
          <CircularProgress />
        </StyledFiles>
      )
    }

    const lastDeclaration = declarations[0]

    const remainingDocumentsPerDeclaration = declarations.map((declaration) => {
      const neededAdditionalDocuments = additionalDocuments.filter(
        (doc) => !!declaration[doc.fieldToCheck],
      )
      const missingAdditionalDocuments = neededAdditionalDocuments.filter(
        (doc) => !declaration[doc.name],
      )

      return (
        declaration.employers.reduce(
          // TODO does this work if there is an upload during the same session?
          (prev, employer) => prev + (employer.document ? 0 : 1),
          0,
        ) + missingAdditionalDocuments.length
      )
    })

    const lastDeclarationRemainingDocsNb = remainingDocumentsPerDeclaration[0]
    const otherDeclarationsRemainingDocsNb = remainingDocumentsPerDeclaration
      .slice(1)
      .reduce((prev, nb) => prev + nb, 0)

    return (
      <StyledFiles>
        <StyledTitle variant="title">
          Envoi des documents du mois de{' '}
          {moment(lastDeclaration.declarationMonth.month).format('MMMM YYYY')}
        </StyledTitle>
        <StyledInfo>
          <Typography
            variant="body2"
            style={{
              color: lastDeclarationRemainingDocsNb > 0 ? '#df5555' : '#3e689b',
            }}
          >
            {lastDeclarationRemainingDocsNb > 0
              ? `Reste ${lastDeclarationRemainingDocsNb} documents à fournir`
              : 'Tous vos documents sont prêts à être envoyés'}
          </Typography>
        </StyledInfo>
        {this.renderCurrentDocumentsList(lastDeclaration)}
        <StyledInfo>
          <Typography variant="body2">
            Vous pourrez envoyer vos documents à Pôle Emploi une fois qu'ils
            seront tous là.
            <br />
            Cela permettra une meilleure gestion de votre dossier.
          </Typography>
        </StyledInfo>
        {error && (
          <ErrorMessage variant="body2">
            Une erreur s'est produite, merci de réessayer ultérieurement
          </ErrorMessage>
        )}
        <ButtonsContainer>
          <CustomColorButton component={Link} to="/thanks?later">
            Enregistrer et finir plus tard
          </CustomColorButton>
          <Button
            color="primary"
            variant="raised"
            disabled={lastDeclarationRemainingDocsNb > 0}
            onClick={this.onSubmit}
          >
            Envoyer à Pôle Emploi
          </Button>
        </ButtonsContainer>
        {otherDeclarationsRemainingDocsNb > 0 && (
          <OtherDocumentsContainer>
            <Typography>
              {otherDeclarationsRemainingDocsNb} documents de précédents mois
              n'ont pas encore été envoyés
            </Typography>
            {!this.state.showMissingDocs && (
              <Button color="primary" onClick={this.displayMissingDocs}>
                Afficher les documents manquants
              </Button>
            )}
            {this.state.showMissingDocs &&
              declarations.slice(1).map(this.renderOlderDocumentsList)}
          </OtherDocumentsContainer>
        )}
        <WorkSummary employers={lastDeclaration.employers} />
      </StyledFiles>
    )
  }
}

export default withRouter(Files)
