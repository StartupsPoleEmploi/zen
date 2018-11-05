import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const StyledDialogContent = styled(DialogContent)`
  && {
    text-align: center;
  }
`

const StyledDialogTitle = styled(DialogTitle)`
  text-align: center;
`

const FilesDialog = ({ isOpened }) => (
  <Dialog
    open={isOpened}
    /* if loading, prevent from leaving modal */
    disableEscapeKeyDown
    disableBackdropClick
    aria-labelledby="FilesDialogContentText"
  >
    <StyledDialogTitle>Envoi des documents</StyledDialogTitle>
    <StyledDialogContent>
      <CircularProgress />
      <DialogContentText id="FilesDialogContentText">
        Envoi en cours…<br />
        Merci de patienter et de ne pas fermer cette fenêtre…
      </DialogContentText>
    </StyledDialogContent>
  </Dialog>
)

FilesDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default FilesDialog
