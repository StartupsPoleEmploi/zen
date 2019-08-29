import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import CheckCircle from '@material-ui/icons/CheckCircle'
import { get, noop, sortBy } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import superagent from 'superagent'

import {
  fetchDeclarations as fetchDeclarationAction,
  hideEmployerFilePreview as hideEmployerFilePreviewAction,
  hideInfoFilePreview as hideInfoFilePreviewAction,
  removeDeclarationInfoFilePage as removeDeclarationInfoFilePageAction,
  removeEmployerFilePage as removeEmployerFilePageAction,
  showEmployerFilePreview as showEmployerFilePreviewAction,
  showInfoFilePreview as showInfoFilePreviewAction,
  uploadDeclarationInfoFile as uploadDeclarationInfoFileAction,
  uploadEmployerFile as uploadEmployerFileAction,
  validateEmployerDoc as validateEmployerDocAction,
  validateDeclarationInfoDoc as validateDeclarationInfoDocAction,
} from '../../actions/declarations'
import DocumentUpload from '../../components/Actu/DocumentUpload'
import FilesDialog from '../../components/Actu/FilesDialog'
import FileTransmittedToPE from '../../components/Actu/FileTransmittedToPEDialog'
import LoginAgainDialog from '../../components/Actu/LoginAgainDialog'
import DocumentDialog from '../../components/Generic/documents/DocumentDialog'
import MainActionButton from '../../components/Generic/MainActionButton'
import { secondaryBlue } from '../../constants'
import { formattedDeclarationMonth } from '../../lib/date'
import { canUsePDFViewer } from '../../lib/file'
import {
  selectPreviewedEmployerDoc,
  selectPreviewedInfoDoc,
  utils,
} from '../../selectors/declarations'

const { getEmployerLoadingKey, getEmployerErrorKey } = utils

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
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
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

const FilesSection = styled.section`
  max-width: 88rem;
  width: 100%;
  margin: auto;
  padding-bottom: 4rem;

  &:not(:first-child) {
    padding-top: 4rem;
  }
  &:not(:last-child) {
    border-bottom: 1px solid black;
  }
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
const declarationType = 'declaration'
const infoType = 'info'

const getLoadingKey = ({ id, type }) => `${id}-${type}-loading`
const getErrorKey = ({ id, type }) => `${id}-${type}-error`

const getDeclarationMissingFilesNb = (declaration) => {
  const infoDocumentsRequiredNb = declaration.infos.filter(
    ({ type, file, isTransmitted }) =>
      type !== 'jobSearch' && !file && !isTransmitted,
  ).length

  return (
    declaration.employers.reduce((prev, employer) => {
      if (!employer.hasEndedThisMonth) {
        return prev + (employer.documents[0] ? 0 : 1)
      }

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
const formatInfoDates = ({ startDate, endDate }) =>
  !endDate
    ? `À partir du ${formatDate(startDate)}`
    : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`

// FIXME is this a duplicate with DocumentUpload.types ?
const employerType = 'employer'
const infosType = 'info'
const computeDocUrl = ({ id, type, file }) => {
  // Note: if employer file is missing, there is no data, so we have to check that the id exists
  // But for infosType, the id exists
  if (type === employerType && !id) return null
  if (type === infosType && !!file) return null

  return type === employerType
    ? `/api/employers/files?documentId=${id}`
    : `/api/declarations/files?declarationInfoId=${id}`
}

export class Files extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
    }).isRequired,
    token: PropTypes.string.isRequired,
    declarations: PropTypes.arrayOf(PropTypes.object),
    fetchDeclarations: PropTypes.func.isRequired,
    removeDeclarationInfoFilePage: PropTypes.func.isRequired,
    removeEmployerFilePage: PropTypes.func.isRequired,
    uploadEmployerFile: PropTypes.func.isRequired,
    uploadDeclarationInfoFile: PropTypes.func.isRequired,
    hideEmployerFilePreview: PropTypes.func.isRequired,
    hideInfoFilePreview: PropTypes.func.isRequired,
    previewedEmployerDoc: PropTypes.object,
    previewedInfoDoc: PropTypes.object,
    showInfoFilePreview: PropTypes.func.isRequired,
    showEmployerFilePreview: PropTypes.func.isRequired,
    validateEmployerDoc: PropTypes.func.isRequired,
    validateDeclarationInfoDoc: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }

  state = {
    isSendingFiles: false,
    showSkipConfirmation: false,
    skipFileCallback: noop,
    isLoggedOut: false,
    previewModalProps: null,
  }

  componentDidMount() {
    this.props.fetchDeclarations()
  }

  removePage = (data) =>
    data.type === infoType
      ? this.props.removeDeclarationInfoFilePage(data)
      : this.props.removeEmployerFilePage(data)

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
      declaration.id === this.props.declarations[0].id

    this.setState({ isSendingFiles: true })

    return superagent
      .post('/api/declarations/finish', { id: declaration.id })
      .set('CSRF-Token', this.props.token)
      .then(() => {
        this.setState({
          isSendingFiles: false,
          [getErrorKey({ id: declaration.id, type: declarationType })]: null,
        })
        if (isSendingLastDeclaration) return this.props.history.push('/thanks')
        this.props.fetchDeclarations()
      })
      .catch((error) => {
        // Reporting here to get a metric of how much this happens
        window.Raven.captureException(error)

        if (error.status === 401 || error.status === 403) {
          return this.setState({ isLoggedOut: true })
        }

        this.setState({
          isSendingFiles: false,
          [getErrorKey({ id: declaration.id, type: declarationType })]: error,
        })
        this.props.fetchDeclarations() // fetching declarations again in case something changed (eg. file was transmitted)
      })
  }

  renderDocumentList = (declaration) => {
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
              allowSkipFile: true,
            })}
          </StyledList>
        </div>
      ),
    )

    // do not display a section if there are no documents to display.
    if (sortedEmployers.length + infoDocumentsNodes.length === 0) return null

    return (
      <div>
        {sortedEmployers.map((employer, index) => (
          <div className="employer-row" key={employer.id}>
            <Typography
              variant="subtitle1"
              style={{ textTransform: 'uppercase' }}
            >
              <b>Employeur&nbsp;: {employer.employerName}</b>
            </Typography>
            <StyledList>
              {this.renderEmployerRow({
                employer,
                allowSkipFile: true,
                showTooltip: index === 0,
              })}
            </StyledList>
          </div>
        ))}

        <div>{infoDocumentsNodes}</div>
      </div>
    )
  }

  renderDocumentsOfType = ({ label, name, declaration, allowSkipFile }) =>
    declaration.infos
      .filter(({ type }) => type === name)
      .map((info) => (
        <DocumentUpload
          key={`${name}-${info.id}`}
          id={info.id}
          type={DocumentUpload.types.info}
          url={computeDocUrl({ id: info.id, type: DocumentUpload.types.info })}
          label={label}
          caption={formatInfoDates(info)}
          fileExistsOnServer={!!info.file && !info.isCleanedUp}
          submitFile={this.props.uploadDeclarationInfoFile}
          removePageFromFile={this.removePageFromFile}
          canUsePDFViewer={info.file ? canUsePDFViewer(info.file) : null}
          showPreview={this.props.showInfoFilePreview}
          skipFile={(params) =>
            this.askToSkipFile(() => {
              this.props.uploadDeclarationInfoFile({ ...params, skip: true })
              this.closeSkipModal()
            })
          }
          originalFileName={info.originalFileName}
          allowSkipFile={allowSkipFile}
          isTransmitted={info.isTransmitted}
          declarationInfoId={info.id}
          isLoading={this.state[getLoadingKey({ id: info.id, type: infoType })]}
          error={this.state[getErrorKey({ id: info.id, type: infoType })]}
        />
      ))

  renderEmployerRow = ({ employer, allowSkipFile, showTooltip }) => {
    const salaryDoc = employer.documents.find(
      ({ type }) => type === salarySheetType,
    )
    const certificateDoc = employer.documents.find(
      ({ type }) => type === employerCertificateType,
    )

    const commonProps = {
      type: DocumentUpload.types.employer,
      submitFile: this.props.uploadEmployerFile,
      showTooltip,
      skipFile: (params) =>
        this.askToSkipFile(() => {
          this.props.uploadEmployerFile({ ...params, skip: true })
          this.closeSkipModal()
        }),
      allowSkipFile,
      employerId: employer.id,
      showPreview: this.props.showEmployerFilePreview,
    }

    const salarySheetUpload = (
      <DocumentUpload
        {...commonProps}
        key={`${employer.id}-${salarySheetType}`}
        id={get(salaryDoc, 'id')}
        label="Bulletin de salaire"
        fileExistsOnServer={
          !!get(salaryDoc, 'file') && !get(salaryDoc, 'isCleanedUp')
        }
        removePage={this.removePage}
        canUsePDFViewer={
          get(salaryDoc, 'file') ? canUsePDFViewer(salaryDoc.file) : false
        }
        url={computeDocUrl({
          id: get(salaryDoc, 'id'),
          type: DocumentUpload.types.employer,
        })}
        isTransmitted={get(salaryDoc, 'isTransmitted')}
        employerDocType={salarySheetType}
        isLoading={employer[getEmployerLoadingKey(salarySheetType)]}
        error={employer[getEmployerErrorKey(salarySheetType)]}
      />
    )

    if (!employer.hasEndedThisMonth) return salarySheetUpload

    const certificateUpload = (
      <DocumentUpload
        {...commonProps}
        key={`${employer.id}-${employerCertificateType}`}
        id={get(certificateDoc, 'id')}
        label="Attestation employeur"
        fileExistsOnServer={
          !!get(certificateDoc, 'file') && !get(salaryDoc, 'isCleanedUp')
        }
        removePage={this.removePage}
        canUsePDFViewer={
          get(certificateDoc, 'file')
            ? canUsePDFViewer(certificateDoc.file)
            : false
        }
        url={computeDocUrl({
          id: get(certificateDoc, 'id'),
          type: DocumentUpload.types.employer,
        })}
        isTransmitted={get(certificateDoc, 'isTransmitted')}
        infoTooltipText={
          employer.hasEndedThisMonth
            ? `Le justificatif contenant votre attestation employeur doit être composé d'exactement deux pages`
            : null
        }
        employerDocType={employerCertificateType}
        isLoading={employer[getEmployerLoadingKey(employerCertificateType)]}
        error={employer[getEmployerErrorKey(employerCertificateType)]}
      />
    )

    return (
      <Fragment>
        {certificateUpload}
        {certificateDoc && !salaryDoc ? (
          <Typography variant="caption">
            <span
              aria-hidden
              style={{ display: 'inline-block', paddingRight: '0.5rem' }}
            >
              👍
            </span>
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
          Justificatifs de {formattedMonth}
        </StyledTitle>
        <StyledInfo>
          <Typography
            variant="body1"
            style={{
              color: secondaryBlue,
              paddingBottom: '2rem',
            }}
          >
            {declarationRemainingDocsNb > 0
              ? `Il manque encore ${declarationRemainingDocsNb} justificatif${
                  declarationRemainingDocsNb > 1 ? 's' : ''
                } et vous pourrez valider l'envoi`
              : 'Tous vos justificatifs sont prêts à être envoyés'}
          </Typography>
        </StyledInfo>
        {this.renderDocumentList(declaration)}
        {this.state[
          getErrorKey({ type: declarationType, id: declaration.id })
        ] && (
          <ErrorMessage variant="body1">
            Nous sommes désolés, une erreur s'est produite lors de l'envoi des
            justificatifs. Merci de bien vouloir réessayer.
            <br />
            Si le problème se reproduit, merci de bien vouloir contacter
            l'équipe Zen.
          </ErrorMessage>
        )}
        <ButtonsContainer>
          <MainActionButton
            disabled={declarationRemainingDocsNb > 0}
            primary
            className="send-to-pe"
            onClick={() => this.onSubmit({ declaration })}
          >
            Envoyer <br />à Pôle Emploi
          </MainActionButton>
          {!isOldMonth && (
            <MainActionButton
              primary={false}
              component={Link}
              to="/thanks?later"
              className="save-for-later"
            >
              Enregistrer
              <br />
              et finir plus tard
            </MainActionButton>
          )}
        </ButtonsContainer>
      </FilesSection>
    )
  }

  render() {
    const {
      declarations: allDeclarations,
      isLoading,
      previewedEmployerDoc,
      previewedInfoDoc,
      hideEmployerFilePreview,
      hideInfoFilePreview,
      uploadEmployerFile,
      uploadDeclarationInfoFile,
      removeEmployerFilePage,
      removeDeclarationInfoFilePage,
      validateEmployerDoc,
      validateDeclarationInfoDoc,
    } = this.props

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
    const declarations = allDeclarations.filter(
      ({ hasFinishedDeclaringEmployers }) => hasFinishedDeclaringEmployers,
    )

    const [lastDeclaration] = declarations

    const areUnfinishedDeclarations = declarations
      .slice(1)
      .some(({ isFinished }) => !isFinished)

    const showEmployerPreview = !!get(previewedEmployerDoc, 'file')
    const showInfoDocPreview = !!get(previewedInfoDoc, 'file')

    let previewProps = {}

    if (showEmployerPreview) {
      previewProps = {
        onCancel: hideEmployerFilePreview,
        submitFile: uploadEmployerFile,
        removePage: removeEmployerFilePage,
        validateDoc: validateEmployerDoc,
        url: computeDocUrl({ id: previewedEmployerDoc.id, type: employerType }),
        employerDocType: previewedEmployerDoc.type, // renaming it to avoid confusion
        ...previewedEmployerDoc,
      }
    } else if (showInfoDocPreview) {
      previewProps = {
        onCancel: hideInfoFilePreview,
        submitFile: uploadDeclarationInfoFile,
        removePage: removeDeclarationInfoFilePage,
        validateDoc: validateDeclarationInfoDoc,
        url: computeDocUrl({ id: previewedInfoDoc.id, type: infoType }),
        ...previewedInfoDoc,
      }
    }

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
            Vous avez terminé l'envoi des justificatifs du mois de{' '}
            {formattedDeclarationMonth(lastDeclaration.declarationMonth.month)}
          </StyledTitle>
        ) : (
          this.renderSection(lastDeclaration)
        )}
        {declarations.slice(1).map(this.renderOldSection)}
        <FilesDialog isOpened={this.state.isSendingFiles} />
        <LoginAgainDialog isOpened={this.state.isLoggedOut} />
        <FileTransmittedToPE
          isOpened={this.state.showSkipConfirmation}
          onCancel={this.closeSkipModal}
          onConfirm={this.state.skipFileCallback}
        />

        {(showEmployerPreview || showInfoDocPreview) && (
          <DocumentDialog isOpened {...previewProps} />
        )}
      </StyledFiles>
    )
  }
}

export default connect(
  (state) => ({
    declarations: state.declarationsReducer.declarations,
    isLoading: state.declarationsReducer.isLoading,
    previewedEmployerDoc: selectPreviewedEmployerDoc(state),
    previewedInfoDoc: selectPreviewedInfoDoc(state),
  }),
  {
    fetchDeclarations: fetchDeclarationAction,
    uploadEmployerFile: uploadEmployerFileAction,
    uploadDeclarationInfoFile: uploadDeclarationInfoFileAction,
    removeEmployerFilePage: removeEmployerFilePageAction,
    removeDeclarationInfoFilePage: removeDeclarationInfoFilePageAction,
    showEmployerFilePreview: showEmployerFilePreviewAction,
    showInfoFilePreview: showInfoFilePreviewAction,
    hideEmployerFilePreview: hideEmployerFilePreviewAction,
    hideInfoFilePreview: hideInfoFilePreviewAction,
    validateEmployerDoc: validateEmployerDocAction,
    validateDeclarationInfoDoc: validateDeclarationInfoDocAction,
  },
)(Files)
