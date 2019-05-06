import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import CheckCircle from '@material-ui/icons/CheckCircle'
import { cloneDeep, get, noop, sortBy } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import FilesDialog from '../../components/Actu/FilesDialog'
import FileTransmittedToPE from '../../components/Actu/FileTransmittedToPEDialog'
import LoginAgainDialog from '../../components/Actu/LoginAgainDialog'
import WorkSummary from '../../components/Actu/WorkSummary'
import MainActionButton from '../../components/Generic/MainActionButton'
import DocumentUpload from '../../components/Actu/DocumentUpload'
import { formattedDeclarationMonth } from '../../lib/date'


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

const ErrorMessage = styled(Typography)`
  && {
    color: red;
    text-align: center;
    padding-top: 1.5rem;
  }
`

const OtherDocumentsContainer = styled.div`
  background-color: #f2f2f2;

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

const infoSpecs = [
  {
    name: 'sickLeave',
    fieldToCheck: 'hasSickLeave',
    label: 'Feuille maladie',
    sectionLabel: 'Congé maladie',
    dateFields: ['startDate', 'endDate'],
    multiple: true,
  },
  {
    name: 'internship',
    fieldToCheck: 'hasInternship',
    label: 'Attestation de stage',
    sectionLabel: 'Stage',
    dateFields: ['startDate', 'endDate'],
    multiple: true,
  },
  {
    name: 'maternityLeave',
    fieldToCheck: 'hasMaternityLeave',
    label: 'Attestation de congé maternité',
    sectionLabel: 'Congé maternité',
    dateFields: ['startDate'],
  },
  {
    name: 'retirement',
    fieldToCheck: 'hasRetirement',
    label: 'Attestation retraite',
    sectionLabel: 'Retraite',
    dateFields: ['startDate'],
  },
  {
    name: 'invalidity',
    fieldToCheck: 'hasInvalidity',
    label: 'Attestation invalidité',
    sectionLabel: 'Invalidité',
    dateFields: ['startDate'],
  },
]

const salarySheetType = 'salarySheet'
const employerCertificateType = 'employerCertificate'
const infoType = 'info'

const getLoadingKey = ({ id, type }) => `${id}-${type}-loading`
const getErrorKey = ({ id, type }) => `${id}-${type}-error`

const getDeclarationMissingFilesNb = (declaration) => {
  const infoDocumentsRequiredNb = declaration.infos.filter(
    ({ type, file }) => type !== 'jobSearch' && !file,
  ).length

  return (
    declaration.employers.reduce((prev, employer) => {
      if (!employer.hasEndedThisMonth)
        return prev + (employer.documents[0] ? 0 : 1)

      /*
          The salary sheet is optional for users which have already sent their employer certificate,
          in which case we do not count it in the needed documents.
        */
      const hasEmployerCertificate = employer.documents.some(
        ({ type }) => type === employerCertificateType,
      )
      const hasSalarySheet = employer.documents.some(
        ({ type }) => type === salarySheetType,
      )

      if (hasEmployerCertificate) return prev + 0
      return prev + (hasSalarySheet ? 1 : 2)
    }, 0) + infoDocumentsRequiredNb
  )
}

const formatDate = (date) => moment(date).format('DD MMMM YYYY')
const formatInfoDates = ({ startDate, endDate }) => {
  return !endDate
    ? `À partir du ${formatDate(startDate)}`
    : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`
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

  submitEmployerFile = ({
    documentId,
    file,
    skip,
    employerId,
    employerDocType,
  }) => {
    const loadingKey = getLoadingKey({
      id: employerId,
      type: employerDocType,
    })
    const errorKey = getErrorKey({ id: employerId, type: employerDocType })

    this.closeSkipModal()

    this.setState({ [loadingKey]: true, [errorKey]: null })

    let request = superagent
      .post('/api/employers/files')
      .set('CSRF-Token', this.props.token)
      .field('employerId', employerId)
      .field('documentType', employerDocType)

    if (documentId) {
      request = request.field('id', documentId)
    }
    if (skip) {
      request = request.field('skip', true)
    } else {
      request = request.attach('document', file)
    }

    return request
      .then((res) => res.body)
      .then((updatedEmployer) => {
        this.setState((prevState) => {
          const updatedDeclarations = prevState.declarations.map(
            (declaration) => ({
              ...declaration,
              employers: declaration.employers.map((employer) => {
                if (employer.id !== employerId) return employer
                return updatedEmployer
              }),
            }),
          )

          return {
            declarations: updatedDeclarations,
            [loadingKey]: false,
            [errorKey]: null,
          }
        })
      })
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
        this.setState({ [loadingKey]: false, [errorKey]: errorLabel })
      })
  }

  submitAdditionalFile = ({ documentId, file, skip }) => {
    const loadingKey = getLoadingKey({ id: documentId, type: infoType })
    const errorKey = getErrorKey({ id: documentId, type: infoType })

    this.closeSkipModal()

    this.setState({
      [loadingKey]: true,
      [errorKey]: null,
    })

    let request = superagent
      .post('/api/declarations/files')
      .set('CSRF-Token', this.props.token)
      .field('declarationInfoId', documentId)

    if (skip) {
      request = request.field('skip', true)
    } else {
      request = request.attach('document', file)
    }

    return request
      .then((res) => res.body)
      .then((declaration) => {
        return this.setState((prevState) => {
          const declarations = cloneDeep(prevState.declarations)
          const declarationIndex = declarations.findIndex(
            ({ id: declarationId }) => declaration.id === declarationId,
          )
          declarations[declarationIndex] = declaration

          return {
            declarations,
            [loadingKey]: false,
          }
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

        this.setState((prevState) => {
          return {
            isSendingFiles: false,
            declarations: prevState.declarations.map((prevDeclaration) => {
              if (declaration.id !== prevDeclaration.id) return prevDeclaration
              return {
                ...declaration,
                error,
              }
            }),
          }
        })
        this.fetchDeclarations() // fetching declarations again in case something changed (eg. file was transmitted)
      })
  }

  renderDocumentList = ({ declaration, isOldMonth }) => {
    const neededAdditionalDocumentsSpecs = infoSpecs.filter(
      (spec) => !!declaration[spec.fieldToCheck],
    )

    const sortedEmployers = sortBy(declaration.employers, 'name')

    const infoDocumentsNodes = neededAdditionalDocumentsSpecs.map(
      (neededDocumentSpecs) => (
        <div key={neededDocumentSpecs.name}>
          <Typography
            variant="subtitle1"
            style={{ textTransform: 'uppercase' }}
          >
            <b>{neededDocumentSpecs.sectionLabel}</b>
          </Typography>
          <StyledList>
            {this.renderDocumentsOfType({
              label: neededDocumentSpecs.label,
              name: neededDocumentSpecs.name,
              multiple: neededDocumentSpecs.multiple,
              declaration,
              allowSkipFile: isOldMonth,
            })}
          </StyledList>
        </div>
      ),
    )

    // do not display a section if there are no documents to display.
    if (sortedEmployers.length + infoDocumentsNodes.length === 0) return null

    return (
      <div>
        {sortedEmployers.map((employer) => (
          <div key={employer.id}>
            <Typography
              variant="subtitle1"
              style={{ textTransform: 'uppercase' }}
            >
              <b>Documents employeur&nbsp;: {employer.employerName}</b>
            </Typography>
            <StyledList>
              {this.renderEmployerRow({
                employer,
                allowSkipFile: isOldMonth,
              })}
            </StyledList>
          </div>
        ))}

        <div>{infoDocumentsNodes}</div>
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

  renderDocumentsOfType = ({ label, name, declaration, allowSkipFile }) =>
    declaration.infos
      .filter(({ type }) => type === name)
      .map((info) => (
        <DocumentUpload
          key={`${name}-${info.id}`}
          id={info.id}
          type={DocumentUpload.types.info}
          label={label}
          caption={formatInfoDates(info)}
          fileExistsOnServer={!!info.file}
          submitFile={this.submitAdditionalFile}
          skipFile={() =>
            this.askToSkipFile((params) =>
              this.submitAdditionalFile({ ...params, skip: true }),
            )
          }
          allowSkipFile={allowSkipFile}
          isTransmitted={info.isTransmitted}
          declarationInfoId={info.id}
          isLoading={this.state[getLoadingKey({ id: info.id, type: infoType })]}
          error={this.state[getErrorKey({ id: info.id, type: infoType })]}
        />
      ))

  renderEmployerRow = ({ employer, allowSkipFile }) => {
    const salaryDoc = employer.documents.find(
      ({ type }) => type === salarySheetType,
    )
    const certificateDoc = employer.documents.find(
      ({ type }) => type === employerCertificateType,
    )

    const commonProps = {
      type: DocumentUpload.types.employer,
      submitFile: this.submitEmployerFile,
      skipFile: (params) =>
        this.askToSkipFile(() =>
          this.submitEmployerFile({ ...params, skip: true }),
        ),
      allowSkipFile,
      employerId: employer.id,
    }

    const salarySheetUpload = (
      <DocumentUpload
        {...commonProps}
        key={`${employer.id}-${salarySheetType}`}
        id={get(salaryDoc, 'id')}
        label="Bulletin de salaire"
        fileExistsOnServer={!!salaryDoc}
        isTransmitted={get(salaryDoc, 'isTransmitted')}
        employerDocType={salarySheetType}
        isLoading={
          this.state[getLoadingKey({ id: employer.id, type: salarySheetType })]
        }
        error={
          this.state[getErrorKey({ id: employer.id, type: salarySheetType })]
        }
      />
    )

    if (!employer.hasEndedThisMonth) return salarySheetUpload

    const certificateUpload = (
      <DocumentUpload
        {...commonProps}
        key={`${employer.id}-${employerCertificateType}`}
        id={get(certificateDoc, 'id')}
        label="Attestation employeur"
        fileExistsOnServer={!!certificateDoc}
        isTransmitted={get(certificateDoc, 'isTransmitted')}
        infoTooltipText={
          employer.hasEndedThisMonth
            ? `Le document contenant votre attestation employeur doit être composé d'exactement deux pages`
            : null
        }
        employerDocType={employerCertificateType}
        isLoading={
          this.state[
          getLoadingKey({ id: employer.id, type: employerCertificateType })
          ]
        }
        error={
          this.state[
          getErrorKey({
            id: employer.id,
            type: employerCertificateType
          })
          ]
        }
      />
    )

    return (
      <Fragment>
        {certificateUpload}
        {certificateDoc && !salaryDoc ? (
          <Typography variant="caption">
            <span aria-hidden>👍</span>
            Nous n'avons pas besoin de votre bulletin de salaire pour cet
            employeur, car vous nous avez déjà transmis votre attestation
          </Typography>
        ) : (
            salarySheetUpload
          )}
      </Fragment>
    )
  }

  renderOldSection = (declaration) => this.renderSection(declaration, true)

  renderSection = (declaration, isOldMonth) => {
    const declarationRemainingDocsNb = getDeclarationMissingFilesNb(declaration)

    const formattedMonth = formattedDeclarationMonth(
      declaration.declarationMonth.month,
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
        <StyledTitle variant="h6" component="h1">
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
        {declaration.error && (
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
            <MainActionButton
              primary={false}
              component={Link}
              to="/thanks?later"
            >
              Enregistrer
              <br />
              et finir plus tard
            </MainActionButton>
          )}
          <MainActionButton
            disabled={declarationRemainingDocsNb > 0}
            primary
            onClick={() => this.onSubmit({ declaration })}
          >
            Envoyer
            {!isOldMonth && <br />}
            {isOldMonth
              ? `les documents de ${formattedMonth}`
              : 'à Pôle Emploi'}
          </MainActionButton>
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

    if (
      !lastDeclaration ||
      (lastDeclaration.isFinished && !areUnfinishedDeclarations)
    ) {
      // Users have come to this page without any old documents to validate
      return (
        <StyledFiles>
          <StyledTitle variant="h6" component="h1">
            Vous n'avez pas de fichier à envoyer.
          </StyledTitle>
        </StyledFiles>
      )
    }

    return (
      <StyledFiles>
        {lastDeclaration.isFinished ? (
          <StyledTitle variant="h6" component="h1">
            Vous avez terminé l'envoi des documents du mois de{' '}
            {formattedDeclarationMonth(lastDeclaration.declarationMonth.month)}
          </StyledTitle>
        ) : (
            this.renderSection(lastDeclaration)
          )}
        {areUnfinishedDeclarations > 0 && (
          <OtherDocumentsContainer>
            <Typography paragraph style={{ textAlign: 'center' }}>
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
