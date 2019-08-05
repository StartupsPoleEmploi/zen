import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import { withStyles, CircularProgress } from '@material-ui/core'
import PropTypes from 'prop-types'

import Dialog from '@material-ui/core/Dialog'
import DialogContentText from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Done'
import WarningIcon from '@material-ui/icons/Warning'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import DeleteIcon from '@material-ui/icons/DeleteForever'
import AddCircleOutline from '@material-ui/icons/AddCircleOutline'
import Typography from '@material-ui/core/Typography'
import MainActionButton from '../MainActionButton'

import sendDoc from '../../../images/sendDoc.svg'
import { primaryBlue, mobileBreakpoint } from '../../../constants'
import PDFViewer from '../PDFViewer'

export const MAX_PDF_PAGE = 5

const styles = (theme) => ({
  paper: {
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      maxWidth: 'inherit',
      maxHeight: 'inherit',
      height: '100vh',
      margin: 0,
    },
  },
})

const ModalButton = styled(Button)`
  && {
    font-size: 1.7rem;
    font-weight: normal;
    margin-right: 3rem;

    @media (max-width: ${mobileBreakpoint}) {
      margin: 0 0 2rem 0;
    }
  }
`

const StyledModalButton = styled(ModalButton)`
  && {
    position: absolute;
    left: 2rem;
    top: 1rem;
    z-index: 2;
  }
`

const TopDialogActions = styled.div`
  position: sticky;
  top: 0;
  right: 1rem;
  text-align: right;
  z-index: 2;
  background: white;
  padding: 1rem;
`

const StyledDialogActions = styled(DialogActions)`
  && {
    position: sticky;
    bottom: 0;
    background: white;
    justify-content: center;
    padding: 1rem;
    border-top: solid 3px rgb(244, 244, 244);

    @media (max-width: ${mobileBreakpoint}) {
      flex-direction: column;
    }
  }
`

const ErrorMessage = styled(Typography)`
  && {
    color: red;
  }
`
const SuccessMessage = styled(Typography)`
  && {
    font-size: 1.7rem;
  }
`

const WarningMessage = styled(Typography)`
  && {
    display: flex;
    align-items: center;
    margin-right: 3rem;
  }
`

const FileLabel = styled.label`
  border: dashed 2px ${primaryBlue};
  padding: 5rem;
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-bottom: 5rem;
`

const StyledImg = styled.img`
  max-width: 20rem;
  margin: 2rem auto;
`

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 2rem;
    vertical-align: bottom;
    color: green;

    @media (max-width: ${mobileBreakpoint}) {
      margin: 0 1rem;
    }
  }
`

const buttonStyle = {
  width: 'auto',
  height: 'auto',
  fontSize: '1.7rem',
}

class DocumentDialog extends Component {
  static propTypes = {
    isOpened: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    pdfUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    addFile: PropTypes.func.isRequired,
    submitFile: PropTypes.func.isRequired,
    removePage: PropTypes.func.isRequired,
  }

  state = {
    uploadView: false,
    showSuccessAddMessage: false,
    showSuccessRemoveMessage: false,

    isRemovingOrAdded: false,
    showConfirmRemove: false,

    canUploadMoreFile: true,
    canDeletePage: false,

    pageAdded: false,
    currentPage: null,
  }

  /**
   * Only parent component know that a file has been removed/added.
   * So we have to update the state of the dialog from incoming props
   * TODO: refacto => https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
   */
  static getDerivedStateFromProps = (props, currentState) => {
    if (!currentState.uploadView && props.pdfUrl === null) {
      return { ...currentState, uploadView: true }
    }
    if (!props.isOpened && currentState.uploadView && props.pdfUrl !== null) {
      return { ...currentState, uploadView: false }
    }
    return null
  }

  showUploadView = () =>
    this.setState({
      uploadView: true,
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
    })

  cancelUploadView = () =>
    this.setState({ uploadView: false, isRemovingOrAdded: false })

  addFile = (e) => {
    this.setState({
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
      isRemovingOrAdded: true,
    })

    if (this.props.pdfUrl === null) {
      return this.props
        .submitFile(e)
        .then(() => {
          this.cancelUploadView()
        })
        .catch(() => this.cancelUploadView())
    }

    this.props
      .addFile(e)
      .then(() => {
        this.setState({
          showSuccessAddMessage: true,
          pageAdded: true,
        })
        this.cancelUploadView()
      })
      .catch(() => {
        this.cancelUploadView()
      })
  }

  confirmRemovePage = () => this.setState({ showConfirmRemove: true })

  cancelRemovePage = () => this.setState({ showConfirmRemove: false })

  removePage = () => {
    this.cancelRemovePage()
    this.setState({
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
      isRemovingOrAdded: true,
    })

    this.props
      .removePage(this.state.currentPage)
      .then(() => {
        this.setState({
          showSuccessRemoveMessage: true,
          isRemovingOrAdded: false,
        })
        this.cancelUploadView()
      })
      .catch(() => this.cancelUploadView())
  }

  onPageNumberChange = (currentPage, totalPageNumber) => {
    this.setState({ currentPage })

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
    this.setState({
      uploadView: false,
      pageAdded: false,
      showSuccessAddMessage: false,
      showSuccessRemoveMessage: false,
    })
    this.props.onCancel()
  }

  renderModalContent() {
    const { isRemovingOrAdded, uploadView } = this.state
    const { pdfUrl } = this.props

    if (isRemovingOrAdded) {
      return <CircularProgress style={{ margin: '10rem 0' }} />
    }

    if (uploadView || pdfUrl === null) {
      return (
        <Fragment>
          {/* Can return to PDF viewer only if there is a PDF to see */}
          {pdfUrl && (
            <StyledModalButton onClick={this.cancelUploadView}>
              <ArrowBackIcon
                style={{ color: primaryBlue, marginRight: '1rem' }}
              />
              Retour
            </StyledModalButton>
          )}

          <FileLabel>
            <StyledImg src={sendDoc} alt="" />
            <Typography variant="body1">
              Veuillez choisir les fichiers à ajouter depuis votre ordinateur
            </Typography>
            <MainActionButton
              primary
              style={{ ...buttonStyle, margin: '2rem auto 0 auto' }}
              component="label"
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
    const { classes, isOpened, title, error } = this.props
    const {
      isRemovingOrAdded,
      uploadView,
      showSuccessAddMessage,
      showSuccessRemoveMessage,
      canUploadMoreFile,
      canDeletePage,
      pageAdded,
      showConfirmRemove,
    } = this.state

    return (
      <Fragment>
        <Dialog
          open={isOpened}
          onClose={this.onCancel}
          aria-labelledby={title}
          maxWidth="lg"
          fullWidth
          classes={{
            paper: classes.paper,
          }}
        >
          <TopDialogActions>
            <ModalButton onClick={this.onCancel}>
              Fermer la prévisualisation
              <CloseIcon
                style={{
                  marginLeft: '1rem',
                  fontWeight: 'normal',
                  height: '3rem',
                }}
              />
            </ModalButton>
          </TopDialogActions>

          <DialogContentText
            style={{
              margin: '0 auto',
              padding: '0',
              overflowY: 'unset',
              maxWidth: '100%',
            }}
          >
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {error && <ErrorMessage>{error}</ErrorMessage>}

              {showSuccessAddMessage && (
                <SuccessMessage>
                  <StyledDoneIcon />
                  Page ajoutée
                </SuccessMessage>
              )}

              {showSuccessRemoveMessage && (
                <SuccessMessage>
                  <StyledDoneIcon />
                  Page supprimée
                </SuccessMessage>
              )}
            </div>

            {this.renderModalContent()}
          </DialogContentText>

          {!isRemovingOrAdded && !uploadView && (
            <StyledDialogActions>
              {canDeletePage && (
                <ModalButton onClick={this.confirmRemovePage}>
                  <DeleteIcon
                    style={{
                      color: primaryBlue,
                      marginRight: '1rem',
                      fontSize: '3rem',
                    }}
                  />
                  Supprimer la page
                </ModalButton>
              )}
              {canUploadMoreFile ? (
                <ModalButton onClick={this.showUploadView}>
                  <AddCircleOutline
                    style={{
                      color: primaryBlue,
                      marginRight: '1rem',
                      fontSize: '3rem',
                    }}
                  />
                  Ajouter une nouvelle page
                </ModalButton>
              ) : (
                <WarningMessage>
                  <WarningIcon
                    style={{ marginRight: '1rem', maxWidth: '50%' }}
                  />
                  Vous avez atteint le nombre de pages autorisé ({MAX_PDF_PAGE}{' '}
                  pages).
                </WarningMessage>
              )}
              {pageAdded && (
                <MainActionButton
                  primary
                  onClick={this.onCancel}
                  style={buttonStyle}
                >
                  Valider
                </MainActionButton>
              )}
            </StyledDialogActions>
          )}
        </Dialog>

        {/* Confirmation dialog when removing a page */}
        <Dialog
          open={showConfirmRemove}
          onClose={this.cancelRemovePage}
          maxWidth="sm"
          fullWidth
          aria-labelledby="alert-dialog-title"
        >
          <Typography
            id="alert-dialog-title"
            style={{
              margin: '5rem 0 4rem 0',
              textAlign: 'center',
              fontSize: '1.7rem',
            }}
          >
            Êtes-vous <span aria-label="sûr">sûr(e)</span> de vouloir supprimer
            cette page ?
          </Typography>

          <DialogActions
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '4rem',
            }}
          >
            <MainActionButton
              primary={false}
              onClick={this.cancelRemovePage}
              style={{ ...buttonStyle, marginRight: '3rem' }}
            >
              Non, j'annule
            </MainActionButton>
            <MainActionButton
              primary
              onClick={this.removePage}
              style={buttonStyle}
            >
              Oui, je confirme
            </MainActionButton>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default withStyles(styles)(DocumentDialog)
