import React, { Component, Fragment } from 'react'
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
import PDFViewer from '../PDFViewer'
import CustomDialog from '../CustomDialog'

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

const buttonStyle = {
  width: 'auto',
  height: 'auto',
  fontSize: '1.7rem',
}

const initialState = {
  showUploadView: false,
  showSuccessAddMessage: false,
  showSuccessRemoveMessage: false,
  showPageRemovalConfirmation: false,
  canUploadMoreFile: true,
  canDeletePage: false,
  hasPageBeenAdded: false,
  currentPage: null,
  totalPageNumber: null,
}

class DocumentDialog extends Component {
  static propTypes = {
    isOpened: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    pdfUrl: PropTypes.string,
    addFile: PropTypes.func.isRequired,
    submitFile: PropTypes.func.isRequired,
    removePage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
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
        hasPageBeenAdded: true,
        showUploadView: false,
      })
    }
  }

  doShowUploadView = () =>
    this.setState({
      showUploadView: true,
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
    })

  cancelUploadView = () => this.setState({ showUploadView: false })

  addFile = ({
    target: {
      files: [file],
    },
  }) => {
    this.setState({
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
    })

    if (!this.props.pdfUrl) {
      return this.props.submitFile(file)
    }

    this.props.addFile(file)
  }

  confirmPageRemoval = () =>
    this.setState({ showPageRemovalConfirmation: true })

  cancelRemovePage = () => this.setState({ showPageRemovalConfirmation: false })

  removePage = () => {
    this.setState({
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
      showPageRemovalConfirmation: false,
    })

    this.props.removePage(this.state.currentPage)
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
    const { isLoading, pdfUrl } = this.props

    if (isLoading) {
      return <CircularProgress style={{ margin: '10rem 0' }} />
    }

    if (showUploadView || !pdfUrl) {
      return (
        <Fragment>
          {/* Can return to PDF viewer only if there is a PDF to see */}
          {pdfUrl && (
            <Button onClick={this.cancelUploadView}>
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
        </Fragment>
      )
    }

    return (
      <PDFViewer url={pdfUrl} onPageNumberChange={this.onPageNumberChange} />
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
      hasPageBeenAdded,
      showPageRemovalConfirmation,
    } = this.state

    return (
      <Fragment>
        <CustomDialog
          isOpened={isOpened}
          onCancel={this.onCancel}
          fullWidth
          maxWidth="md"
          content={
            <Fragment>
              <TopDialogActions>
                <Button onClick={this.onCancel}>
                  Fermer la prévisualisation
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

                {hasPageBeenAdded && (
                  <MainActionButton
                    primary
                    onClick={this.onCancel}
                    style={buttonStyle}
                  >
                    Valider
                  </MainActionButton>
                )}
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
      </Fragment>
    )
  }
}

export default DocumentDialog
