import CircularProgress from '@material-ui/core/CircularProgress'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'

import CustomDialog from '../Generic/CustomDialog'

const FilesDialog = ({ isOpened }) => (
  <CustomDialog
    content={
      <Fragment>
        <CircularProgress />
        <DialogContentText>
          Envoi en cours…<br />
          Merci de patienter et de ne pas fermer cette fenêtre…
        </DialogContentText>
      </Fragment>
    }
    title="Envoi des documents"
    titleId="FilesDialogContentText"
    isOpened={isOpened}
    disableEscapeKeyDown
    disableBackdropClick
  />
)

FilesDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default FilesDialog
