import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React from 'react'

import CustomDialog from '../Generic/CustomDialog'

const LoginAgainDialog = ({ isOpened }) => (
  <CustomDialog
    content={
      <DialogContentText id="LoginAgainDialogContentText">
        Votre session a expiré.
        <br />
        Vos données ont été sauvegardées, merci de bien vouloir vous reconnecter
        en cliquant sur le bouton ci-dessous.
      </DialogContentText>
    }
    actions={
      <Button variant="contained" href="/api/login" color="primary" autoFocus>
        Je me reconnecte
      </Button>
    }
    title="Merci de vous reconnecter"
    titleId="LoginAgainDialogContentText"
    isOpened={isOpened}
    disableEscapeKeyDown
    disableBackdropClick
  />
)

LoginAgainDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default LoginAgainDialog
