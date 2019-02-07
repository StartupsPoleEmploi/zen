import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import CheckCircle from '@material-ui/icons/CheckCircle'
import { cloneDeep, get, noop, sortBy } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Link, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import AdditionalDocumentUpload from '../../components/Actu/AdditionalDocumentUpload'
import EmployerDocumentUpload from '../../components/Actu/EmployerDocumentUpload'
import FilesDialog from '../../components/Actu/FilesDialog'
import LoginAgainDialog from '../../components/Actu/LoginAgainDialog'
import WorkSummary from '../../components/Actu/WorkSummary'
import FileTransmittedToPE from '../../components/Actu/FileTransmittedToPEDialog'

const StyledFiles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 88rem;
  width: 100%;
  margin: auto;
  padding-bottom: 2rem;
`

const StyledTitle = styled(Typography)`
  && {
    margin-bottom: 1.5rem;
    text-align: center;
  }
`

const StyledInfo = styled.div`
  text-align: center;
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 2.5rem;
  text-align: center;
  max-width: 40rem;
  margin: 0 auto;
`

const SaveForLaterButton = styled(Button).attrs({
  color: 'primary',
  variant: 'outlined',
})`
  && {
    margin: 0 0.5rem;
    padding: 1rem 3rem;
    color: #000;
  }
`

const SubmitButton = styled(Button).attrs({
  color: 'primary',
  variant: 'contained',
})`
  && {
    padding: 1rem 3rem;
    margin: 0 0.5rem;
    &:disabled {
      color: #fff;
      background-color: rgba(
        57,
        103,
        158,
        0.5
      ); /* rgb(57,103,158) is our primary color, #39679E */
    }
  }
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
  padding: 1rem;
  width: 100vw;
`

const FilesSection = styled.section`
  max-width: 88rem;
  width: 100%;
  margin: auto;
  padding-bottom: 4rem;
`

const FilesDoneSection = styled(FilesSection)`
  display: flex;
  justify-content: center;
`

const StyledList = styled(List)`
  && {
    padding-bottom: 2rem;
  }
`

const DECLARATION_SUBMIT_ERROR_NAME = 'DECLARATION'

const additionalDocuments = [
  {
    name: 'sickLeaveDocument',
    fieldToCheck: 'hasSickLeave',
    label: 'Feuille maladie',
    sectionLabel: 'Congé maladie',
    dateFields: ['internshipStartDate', 'internshipEndDate'],
  },
  {
    name: 'internshipDocument',
    fieldToCheck: 'hasInternship',
    label: 'Attestation de stage',
    sectionLabel: 'Stage',
    dateFields: ['sickLeaveStartDate', 'sickLeaveEndDate'],
  },
  {
    name: 'maternityLeaveDocument',
    fieldToCheck: 'hasMaternityLeave',
    label: 'Attestation de congé maternité',
    sectionLabel: 'Congé maternité',
    dateFields: ['maternityLeaveStartDate'],
  },
  {
    name: 'retirementDocument',
    fieldToCheck: 'hasRetirement',
    label: 'Attestation retraite',
    sectionLabel: 'Retraite',
    dateFields: ['retirementStartDate'],
  },
  {
    name: 'invalidityDocument',
    fieldToCheck: 'hasInvalidity',
    label: 'Attestation invalidité',
    sectionLabel: 'Invalidité',
    dateFields: ['invalidityStartDate'],
  },
]

const getLoadingKey = ({ name, declarationId }) =>
  `$isLoading-${declarationId}-${name}`
const getErrorKey = ({ name, declarationId }) =>
  `${declarationId}-${name}-Error`

// Get the number of missing files in a declaration
const getDeclarationMissingFilesNb = (declaration) => {
  const missingAdditionalDocuments = additionalDocuments
    .filter((doc) => !!declaration[doc.fieldToCheck])
    .filter((doc) => !declaration[doc.name])

  return (
    declaration.employers.reduce(
      (prev, employer) => prev + (employer.document ? 0 : 1),
      0,
    ) + missingAdditionalDocuments.length
  )
}

export class Files extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
    }).isRequired,
    token: PropTypes.string.isRequired,
  }

  state = {
    isLoading: true,
    error: null,
    showMissingDocs: false,
    declarations: [],
    isSendingFiles: false,
    showSkipConfirmation: false,
    skipFileCallback: noop,
    isLoggedOut: false,
  }

  componentDidMount() {
    this.fetchDeclarations()
  }

  fetchDeclarations = () => {
    this.setState({ isLoading: true })
    superagent
      .get('/api/declarations')
      .then((res) => res.body)
      .then((declarations) =>
        this.setState({
          declarations,
          isLoading: false,
        }),
      )
  }

  displayMissingDocs = () => this.setState({ showMissingDocs: true })

  submitEmployerFile = ({ declarationId, file, employerId, skip }) => {
    this.closeSkipModal()

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

    let request = superagent
      .post('/api/employers/files')
      .set('CSRF-Token', this.props.token)
      .field('employerId', employerId)

    if (skip) {
      request = request.field('skip', true)
    } else {
      request = request.attach('document', file)
    }

    return request
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
              ? 'Erreur : Fichier invalide (accepté : .png, .jpg, .pdf, .doc, .docx)'
              : `Désolé, une erreur s'est produite, Merci de réessayer ultérieurement`
        // TODO this should be refined to not send all common errors
        // (file too big, etc)
        window.Raven.captureException(err)
        updateEmployer({
          declarationId,
          employerId,
          isLoading: false,
          error: errorLabel,
        })
      })
  }

  submitAdditionalFile = ({ declarationId, file, name, skip }) => {
    this.closeSkipModal()

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

    let request = superagent
      .post('/api/declarations/files')
      .set('CSRF-Token', this.props.token)
      .field('declarationId', declarationId)
      .field('name', name)

    if (skip) {
      request = request.field('skip', true)
    } else {
      request = request.attach('document', file)
    }

    return request
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
              ? 'Fichier invalide (accepté : .png, .jpg, .pdf, .doc, .docx)'
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

  askToSkipFile = (onConfirm) => {
    this.setState({
      showSkipConfirmation: true,
      skipFileCallback: onConfirm,
    })
  }

  closeSkipModal = () =>
    this.setState({
      showSkipConfirmation: false,
      skipFileCallback: noop,
    })

  onSubmit = ({ declaration }) => {
    const isSendingLastDeclaration =
      declaration.id === this.state.declarations[0].id

    this.setState({ isSendingFiles: true })

    return superagent
      .post('/api/declarations/finish', { id: declaration.id })
      .set('CSRF-Token', this.props.token)
      .then(() => {
        this.setState({ isSendingFiles: false })
        if (isSendingLastDeclaration) return this.props.history.push('/thanks')
        this.fetchDeclarations()
      })
      .catch((error) => {
        // Reporting here to get a metric of how much this happens
        window.Raven.captureException(error)

        if (error.status === 401 || error.status === 403) {
          return this.setState({ isLoggedOut: true })
        }

        this.setState({
          [getErrorKey({
            declarationId: declaration.id,
            name: DECLARATION_SUBMIT_ERROR_NAME,
          })]: error,
          isSendingFiles: false,
        })
        this.fetchDeclarations() // fetching declarations again in case something changed (eg. file was transmitted)
      })
  }

  renderDocumentList = ({ declaration, isOldMonth }) => {
    const neededAdditionalDocuments = additionalDocuments.filter(
      (doc) => !!declaration[doc.fieldToCheck],
    )

    const sortedEmployers = sortBy(declaration.employers, 'name')

    const salaryNodes = sortedEmployers
      .filter((employer) => !employer.hasEndedThisMonth)
      .map((employer) =>
        this.renderEmployerRow({
          employer,
          declaration,
          allowSkipFile: isOldMonth,
        }),
      )

    const certificateNodes = sortedEmployers
      .filter((employer) => employer.hasEndedThisMonth)
      .map((employer) =>
        this.renderEmployerRow({
          employer,
          declaration,
          allowSkipFile: isOldMonth,
        }),
      )

    const additionalDocumentsNodes = neededAdditionalDocuments.map(
      (neededDocument) => {
        const formattedDates = neededDocument.dateFields.map((dateField) =>
          moment(declaration[dateField]).format('DD MMMM YYYY'),
        )
        return (
          <div key={neededDocument.name}>
            <Typography
              variant="subtitle1"
              style={{ textTransform: 'uppercase' }}
            >
              <b>{neededDocument.sectionLabel}</b>
            </Typography>
            <Typography variant="caption">
              {formattedDates.length === 1 &&
                `À partir du ${formattedDates[0]}`}
              {formattedDates.length === 2 &&
                `Du ${formattedDates.join(' au ')}`}
            </Typography>
            <StyledList>
              {this.renderAdditionalDocument({
                label: neededDocument.label,
                name: neededDocument.name,
                declaration,
                allowSkipFile: isOldMonth,
              })}
            </StyledList>
          </div>
        )
      },
    )

    // do not display a section if there are no documents to display.
    if (
      salaryNodes.length +
        certificateNodes.length +
        additionalDocumentsNodes.length ===
      0
    )
      return null

    return (
      <div>
        <div>
          <Typography
            variant="subtitle1"
            style={{ textTransform: 'uppercase' }}
          >
            <b>
              {salaryNodes.length} bulletin{salaryNodes.length > 1 && 's'} de
              salaire
            </b>
          </Typography>
          <Typography variant="caption">
            Salaire pour{' '}
            {moment(declaration.declarationMonth.month).format('MMMM YYYY')}
          </Typography>
          <StyledList>{salaryNodes}</StyledList>
        </div>

        <div>
          <Typography
            variant="subtitle1"
            style={{ textTransform: 'uppercase' }}
          >
            <b>
              {certificateNodes.length} contrat{certificateNodes.length > 1 &&
                's'}{' '}
              terminé{certificateNodes.length > 1 && 's'}
            </b>
          </Typography>
          <Typography variant="caption">
            Fin de contrat{certificateNodes.length > 1 && 's'} en{' '}
            {moment(declaration.declarationMonth.month).format('MMMM YYYY')}
          </Typography>
          <StyledList>{certificateNodes}</StyledList>
        </div>

        <div>{additionalDocumentsNodes}</div>
      </div>
    )
  }

  renderOlderDocumentsList = (declaration) =>
    this.renderDocumentList({
      declaration,
      isOldMonth: true,
      allowSkipFile: true,
    })

  renderCurrentDocumentsList = (declaration) =>
    this.renderDocumentList({
      declaration,
      isOldMonth: false,
      allowSkipFile: false,
    })

  renderAdditionalDocument = ({ label, name, declaration, allowSkipFile }) => (
    <AdditionalDocumentUpload
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
      }
      submitFile={({ file }) =>
        this.submitAdditionalFile({
          file,
          name,
          declarationId: declaration.id,
        })
      }
      skipFile={() =>
        this.askToSkipFile(() =>
          this.submitAdditionalFile({
            skip: true,
            name,
            declarationId: declaration.id,
          }),
        )
      }
      allowSkipFile={allowSkipFile}
      isTransmitted={get(declaration[name], 'isTransmitted')}
    />
  )

  renderEmployerRow = ({ employer, declaration, allowSkipFile }) => (
    <EmployerDocumentUpload
      key={employer.id}
      {...employer}
      submitFile={({ file }) =>
        this.submitEmployerFile({
          declarationId: declaration.id,
          employerId: employer.id,
          file,
        })
      }
      skipFile={() =>
        this.askToSkipFile(() =>
          this.submitEmployerFile({
            declarationId: declaration.id,
            skip: true,
            employerId: employer.id,
          }),
        )
      }
      allowSkipFile={allowSkipFile}
      fileExistsOnServer={!!employer.document}
      isTransmitted={get(employer.document, 'isTransmitted')}
    />
  )

  renderOldSection = (declaration) => this.renderSection(declaration, true)

  renderSection = (declaration, isOldMonth) => {
    const declarationRemainingDocsNb = getDeclarationMissingFilesNb(declaration)

    const error = this.state[
      getErrorKey({
        declarationId: declaration.id,
        name: DECLARATION_SUBMIT_ERROR_NAME,
      })
    ]

    const formattedMonth = moment(declaration.declarationMonth.month).format(
      'MMMM YYYY',
    )

    if (declaration.isFinished) {
      return (
        <FilesDoneSection key={declaration.id}>
          <Typography variant="body1">
            Fichiers de {formattedMonth} transmis
          </Typography>
          {' '}
          <CheckCircle />
        </FilesDoneSection>
      )
    }

    return (
      <FilesSection key={declaration.id}>
        <StyledTitle variant="h6">
          Envoi des documents du mois de {formattedMonth}
        </StyledTitle>
        <StyledInfo>
          <Typography
            variant="body1"
            style={{
              color: declarationRemainingDocsNb > 0 ? '#df5555' : '#3e689b',
              paddingBottom: '2rem',
            }}
          >
            {declarationRemainingDocsNb > 0
              ? `Reste ${declarationRemainingDocsNb} documents à fournir`
              : 'Tous vos documents sont prêts à être envoyés'}
          </Typography>
        </StyledInfo>
        {isOldMonth
          ? this.renderOlderDocumentsList(declaration)
          : this.renderCurrentDocumentsList(declaration)}
        <WorkSummary employers={declaration.employers} />
        <StyledInfo>
          <Typography variant="body1">
            Vous pourrez envoyer vos documents à Pôle Emploi une fois qu'ils
            seront tous là.
            <br />
            Cela permettra une meilleure gestion de votre dossier.
          </Typography>
        </StyledInfo>
        {error && (
          <ErrorMessage variant="body1">
            Nous sommes désolés, une erreur s'est produite lors de l'envoi des
            documents. Merci de bien vouloir réessayer.
            <br />
            Si le problème se reproduit, merci de bien vouloir contacter
            l'équipe Zen.
          </ErrorMessage>
        )}
        <ButtonsContainer>
          {!isOldMonth && (
            <SaveForLaterButton component={Link} to="/thanks?later">
              Enregistrer
              <br />
              et finir plus tard
            </SaveForLaterButton>
          )}
          <SubmitButton
            disabled={declarationRemainingDocsNb > 0}
            onClick={() => this.onSubmit({ declaration })}
          >
            Envoyer
            {!isOldMonth && <br />}
            {isOldMonth
              ? `les documents de ${formattedMonth}`
              : 'à Pôle Emploi'}
          </SubmitButton>
        </ButtonsContainer>
      </FilesSection>
    )
  }

  render() {
    const { isLoading } = this.state

    if (isLoading) {
      return (
        <StyledFiles>
          <CircularProgress />
        </StyledFiles>
      )
    }

    // display filter : In the case of old declarations displayed,
    // a declaration which had been abandonned by a user at step 2
    // could theoretically be here if the user came back later.
    // We remove that possibility.
    const declarations = this.state.declarations.filter(
      ({ hasFinishedDeclaringEmployers }) => hasFinishedDeclaringEmployers,
    )

    const lastDeclaration = declarations[0]

    const areUnfinishedDeclarations = declarations
      .slice(1)
      .some(({ isFinished }) => !isFinished)

    if (!lastDeclaration) {
      // Users have come to this page without any old documents to validate
      return (
        <StyledFiles>
          <StyledTitle variant="h6">
            Vous n'avez pas de fichier à envoyer.
          </StyledTitle>
        </StyledFiles>
      )
    }

    if (lastDeclaration.isFinished && !areUnfinishedDeclarations) {
      // Users have already validated the last declaration and have
      // finished uploading old documents
      return <Redirect to="/thanks" />
    }

    return (
      <StyledFiles>
        {lastDeclaration.isFinished ? (
          <StyledTitle variant="h6">
            Vous avez terminé l'envoi des documents du mois de{' '}
            {moment(lastDeclaration.declarationMonth.month).format('MMMM YYYY')}
          </StyledTitle>
        ) : (
          this.renderSection(lastDeclaration)
        )}
        {areUnfinishedDeclarations > 0 && (
          <OtherDocumentsContainer>
            <Typography paragraph>
              Des documents de précédents mois n'ont pas encore été transmis
            </Typography>
            {!this.state.showMissingDocs ? (
              <Button color="primary" onClick={this.displayMissingDocs}>
                Afficher les documents manquants
              </Button>
            ) : (
              declarations.slice(1).map(this.renderOldSection)
            )}
          </OtherDocumentsContainer>
        )}
        <FilesDialog isOpened={this.state.isSendingFiles} />
        <LoginAgainDialog isOpened={this.state.isLoggedOut} />
        <FileTransmittedToPE
          isOpened={this.state.showSkipConfirmation}
          onCancel={this.closeSkipModal}
          onConfirm={this.state.skipFileCallback}
        />
      </StyledFiles>
    )
  }
}

export default withRouter(Files)
