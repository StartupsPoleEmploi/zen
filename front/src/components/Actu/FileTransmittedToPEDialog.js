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
        Confirmez-vous que Pôle emploi a déjà ce justificatif ? Ce justificatif ne sera plus demandé sur Zen
      </DialogContentText>
    }
    actions={
      <Fragment>
        <CustomColorButton onClick={onCancel}>J'annule</CustomColorButton>
        <Button
          variant="contained"
          onClick={onConfirm}
          color="primary"
          autoFocus
        >
          Je confirme
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
