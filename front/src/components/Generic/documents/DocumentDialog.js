import React, { Component, Fragment, Suspense } from 'react'
import styled from 'styled-components'
import { CircularProgress } from '@material-ui/core'
import PropTypes from 'prop-types'
import { isNull } from 'lodash'

import Button from '@material-ui/core/Button'

import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Done'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import DeleteIcon from '@material-ui/icons/DeleteForever'
import AddCircleOutline from '@material-ui/icons/AddCircleOutline'
import Typography from '@material-ui/core/Typography'
import MainActionButton from '../MainActionButton'

import sendDoc from '../../../images/sendDoc.svg'
import { primaryBlue } from '../../../constants'
import CustomDialog from '../CustomDialog'

const PDFViewer = React.lazy(() => import('../PDFViewer'))

export const MAX_PDF_PAGE = 5

const TopDialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-bottom: 1rem;
`

const FileLabel = styled.label`
  border: dashed 2px ${primaryBlue};
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 1rem 1rem 5rem 1rem;
`

const StyledImg = styled.img`
  max-width: 50%;
  margin: 2rem auto;
`

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const initialState = {
  showUploadView: false,
  showSuccessAddMessage: false,
  showSuccessRemoveMessage: false,
  showPageRemovalConfirmation: false,
  showDocValidationModal: false,
  canUploadMoreFile: true,
  canDeletePage: false,
  totalPageNumber: null,
}

class DocumentDialog extends Component {
  static propTypes = {
    isOpened: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    originalFileName: PropTypes.string,
    url: PropTypes.string,
    submitFile: PropTypes.func.isRequired,
    removePage: PropTypes.func.isRequired,
    validateDoc: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    id: PropTypes.number,
    employerId: PropTypes.number,
    employerDocType: PropTypes.string,
  }

  state = initialState

  /*
   * Only the parent component know that a file has been removed/added.
   * So we have to update the state of the dialog from incoming props
   * It's also a convenient way to detect a page was added or removed. These will
   * cause an additional render when evaluated, which is ok
   * (one-shot reaction after user upload)
   */
  componentDidUpdate = (prevProps, prevState) => {
    if (!this.props.isOpened) return

    if (prevProps.isLoading && !this.props.isLoading) {
      // eslint-disable-next-line react/no-did-update-set-state
      return this.setState({ showUploadView: false })
    }
    if (
      !isNull(prevState.totalPageNumber) &&
      this.state.totalPageNumber < prevState.totalPageNumber
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      return this.setState({
        showSuccessRemoveMessage: true,
        showUploadView: false,
      })
    }
    if (
      !isNull(prevState.totalPageNumber) &&
      this.state.totalPageNumber > prevState.totalPageNumber
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      return this.setState({
        showSuccessAddMessage: true,
        showUploadView: false,
      })
    }
  }

  addFile = ({
    target: {
      files: [file],
    },
  }) => {
    this.setState({
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
    })

    this.props.submitFile({
      isAddingFile: !!this.props.url,
      file,
      documentId: this.props.id,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })
  }

  removePage = () => {
    this.setState({
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
      showPageRemovalConfirmation: false,
    })
    this.props.removePage({
      pageNumberToRemove: this.state.currentPage,
      documentId: this.props.id,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })
  }

  doShowUploadView = () =>
    this.setState({
      showUploadView: true,
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
    })

  cancelUploadView = () => this.setState({ showUploadView: false })

  confirmPageRemoval = () =>
    this.setState({ showPageRemovalConfirmation: true })

  cancelRemovePage = () => this.setState({ showPageRemovalConfirmation: false })

  confirmDocValidation = () => this.setState({ showDocValidationModal: true })

  cancelValidateDoc = () => this.setState({ showDocValidationModal: false })

  validateDoc = () => {
    this.setState({ showDocValidationModal: false })

    this.props.validateDoc({
      documentId: this.props.id,
      employerId: this.props.employerId,
      employerDocType: this.props.employerDocType,
    })
  }

  /*
   * This is called when the underlying PDF Viewer detects a change in the number
   * of pages, *including* at first load
   */
  onPageNumberChange = (currentPage, totalPageNumber) => {
    this.setState({ currentPage, totalPageNumber })

    const canUploadMoreFile = totalPageNumber < MAX_PDF_PAGE
    if (canUploadMoreFile !== this.state.canUploadMoreFile) {
      this.setState({ canUploadMoreFile })
    }

    const canDeletePage = totalPageNumber > 0
    if (canDeletePage !== this.state.canDeletePage) {
      this.setState({ canDeletePage })
    }
  }

  onCancel = () => {
    this.setState(initialState)
    this.props.onCancel()
  }

  renderModalContent() {
    const { showUploadView } = this.state
    const { isLoading, url, originalFileName } = this.props

    const loadingComponent = <CircularProgress style={{ margin: 'auto' }} />

    if (isLoading) {
      return loadingComponent
    }

    if (showUploadView || !url) {
      return (
        <div>
          {/* Can return to PDF viewer only if there is a PDF to see */}
          {url && (
            <Button onClick={this.cancelUploadView} style={{ display: 'flex' }}>
              <ArrowBackIcon
                style={{ color: primaryBlue, marginRight: '1rem' }}
              />
              Retour
            </Button>
          )}

          <FileLabel>
            <StyledImg src={sendDoc} alt="" />
            <Typography variant="body1" style={{ padding: '1rem' }}>
              Veuillez choisir les fichiers à ajouter depuis votre ordinateur
            </Typography>
            <MainActionButton
              primary
              component="label"
              style={{ margin: 'auto' }}
            >
              <input
                accept=".png, .jpg, .jpeg, .pdf"
                style={{ display: 'none' }}
                type="file"
                onChange={this.addFile}
              />
              Parcourir
            </MainActionButton>
          </FileLabel>
        </div>
      )
    }

    return (
      <Suspense fallback={loadingComponent}>
        <PDFViewer
          url={url}
          onPageNumberChange={this.onPageNumberChange}
          originalFileName={originalFileName}
        />
      </Suspense>
    )
  }

  render() {
    const { isOpened, isLoading, error } = this.props
    const {
      showUploadView,
      showSuccessAddMessage,
      showSuccessRemoveMessage,
      canUploadMoreFile,
      canDeletePage,
      showPageRemovalConfirmation,
      showDocValidationModal,
    } = this.state

    return (
      <Fragment>
        <CustomDialog
          isOpened={isOpened}
          onCancel={this.onCancel}
          fullWidth
          maxWidth="md"
          forceConstantHeight
          content={
            <Fragment>
              <TopDialogActions>
                <Button onClick={this.onCancel}>
                  Fermer
                  <CloseIcon
                    style={{
                      marginLeft: '1rem',
                    }}
                  />
                </Button>
              </TopDialogActions>
              {(error || showSuccessAddMessage || showSuccessRemoveMessage) && (
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  {error && (
                    <Typography role="alert" color="error">
                      {error}!
                    </Typography>
                  )}

                  {showSuccessAddMessage && (
                    <Typography>
                      <StyledDoneIcon />
                      Page ajoutée
                    </Typography>
                  )}

                  {showSuccessRemoveMessage && (
                    <Typography>
                      <StyledDoneIcon />
                      Page supprimée
                    </Typography>
                  )}
                </div>
              )}

              {this.renderModalContent()}
            </Fragment>
          }
          actions={
            !isLoading &&
            !showUploadView && (
              <Fragment>
                {canDeletePage && (
                  <Button
                    onClick={this.confirmPageRemoval}
                    className="delete-page"
                  >
                    <DeleteIcon
                      style={{
                        color: primaryBlue,
                        marginRight: '1rem',
                        fontSize: '3rem',
                      }}
                    />
                    Supprimer la page
                  </Button>
                )}

                <Button
                  className="add-page"
                  onClick={this.doShowUploadView}
                  disabled={!canUploadMoreFile}
                >
                  <AddCircleOutline
                    style={{
                      color: primaryBlue,
                      marginRight: '1rem',
                      fontSize: '3rem',
                    }}
                  />
                  Ajouter une nouvelle page {!canUploadMoreFile && ' (max : 5)'}
                </Button>

                <Button
                  className="validate-file"
                  onClick={this.confirmDocValidation}
                  color="primary"
                  variant="contained"
                >
                  Valider ce justificatif
                </Button>
              </Fragment>
            )
          }
        />

        {/* Confirmation dialog when removing a page */}
        <CustomDialog
          isOpened={showPageRemovalConfirmation}
          onClose={this.cancelRemovePage}
          titleId="alert-dialog-title"
          title={
            <span>
              Êtes-vous <span aria-label="sûr">sûr(e)</span> de vouloir
              supprimer cette page ?
            </span>
          }
          actions={
            <Fragment>
              <MainActionButton primary={false} onClick={this.cancelRemovePage}>
                Non, j'annule
              </MainActionButton>
              <MainActionButton primary onClick={this.removePage}>
                Oui, je confirme
              </MainActionButton>
            </Fragment>
          }
        />

        {/* Confirmation dialog when validating a document */}
        <CustomDialog
          isOpened={showDocValidationModal}
          onClose={this.cancelRemovePage}
          titleId="alert-dialog-title"
          title={<span>Valider ce justificatif ?</span>}
          actions={
            <Fragment>
              <MainActionButton
                primary={false}
                onClick={this.cancelValidateDoc}
              >
                Non, j'annule
              </MainActionButton>
              <MainActionButton
                primary
                onClick={this.validateDoc}
                className="confirm-validate-file"
              >
                Oui, je confirme
              </MainActionButton>
            </Fragment>
          }
        />
      </Fragment>
    )
  }
}

export default DocumentDialog
