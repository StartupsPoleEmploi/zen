import React from 'react'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'

import CustomDialog from '../Generic/CustomDialog'
import MainActionButton from '../Generic/MainActionButton'

const FileTransmittedToPE = ({ isOpened, onCancel, onConfirm }) => (
  <CustomDialog
    fullWidth
    content={
      <DialogContentText style={{ color: 'black', padding: '1rem 2rem' }}>
        Confirmez-vous que Pôle emploi a déjà ce justificatif ? Ce justificatif
        ne sera plus demandé sur Zen
      </DialogContentText>
    }
    actions={
      <>
        <MainActionButton primary={false} onClick={onCancel}>
          Annuler
        </MainActionButton>
        <MainActionButton
          variant="contained"
          onClick={onConfirm}
          color="primary"
        >
          Je confirme
        </MainActionButton>
      </>
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
