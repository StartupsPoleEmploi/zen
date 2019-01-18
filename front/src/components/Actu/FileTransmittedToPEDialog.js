import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'

import CustomColorButton from '../Generic/CustomColorButton'
import CustomDialog from '../Generic/CustomDialog'

const FileTransmittedToPE = ({ isOpened, onCancel, onConfirm }) => (
  <CustomDialog
    content={
      <DialogContentText>
        Avez-vous déjà transmis ce fichier à Pôle Emploi via un autre moyen que
        Zen&nbsp;?
      </DialogContentText>
    }
    actions={
      <Fragment>
        <CustomColorButton onClick={onCancel}>Non</CustomColorButton>
        <Button variant="contained" onClick={onConfirm} color="primary" autoFocus>
          Oui
        </Button>
      </Fragment>
    }
    title="Confirmation"
    titleId="FileTransmittedToPEContentText"
    isOpened={isOpened}
    onCancel={onCancel}
  />
)

FileTransmittedToPE.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default FileTransmittedToPE
