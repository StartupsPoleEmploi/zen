import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'

import CustomColorButton from '../Generic/CustomColorButton'
import CustomDialog from '../Generic/CustomDialog'
import MainActionButton from '../Generic/MainActionButton'

const FileTransmittedToPE = ({ isOpened, onCancel, onConfirm }) => (
  <CustomDialog
    width="xl"
    content={
      <DialogContentText style={{ color: 'black' }}>
        Confirmez-vous que Pôle emploi a déjà ce justificatif ? Ce justificatif
        ne sera plus demandé sur Zen
      </DialogContentText>
    }
    actions={
      <Fragment>
        <CustomColorButton onClick={onCancel}>J'annule</CustomColorButton>
        <MainActionButton
          variant="contained"
          onClick={onConfirm}
          color="primary"
          autoFocus
        >
          Je confirme
        </MainActionButton>
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
