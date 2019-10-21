import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React from 'react'

import CustomDialog from '../Generic/CustomDialog'

const DeclarationTransmitted = ({ isOpened, onCancel }) => (
  <CustomDialog
    content={
      <DialogContentText gutterBottom>
        Si vous êtes en possession de vos justificatifs, vous pouvez dès à
        présent les ajouter à votre dossier Zen.
      </DialogContentText>
    }
    title={
      <span>
        Votre actualisation a bien
        <br />
        été transmise à Pôle emploi !
      </span>
    }
    titleId="DeclarationTransmittedDialogTitle"
    isOpened={isOpened}
    onCancel={onCancel}
    actions={
      <Button variant="contained" onClick={onCancel} color="primary">
        Continuer
      </Button>
    }
  />
)

DeclarationTransmitted.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default DeclarationTransmitted
