import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
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

const StyledDialogActions = styled(DialogActions)`
  && {
    justify-content: space-around;
    padding-bottom: 2rem;
  }
`

const LoginAgainDialog = ({ isOpened }) => (
  <Dialog
    open={isOpened}
    disableEscapeKeyDown
    disableBackdropClick
    aria-labelledby="LoginAgainDialogContentText"
  >
    <StyledDialogTitle>Merci de vous reconnecter</StyledDialogTitle>
    <StyledDialogContent>
      <DialogContentText id="LoginAgainDialogContentText">
        Votre session a expiré.
        <br />
        Vos données ont été sauvegardées, merci de bien vouloir vous reconnecter
        en cliquant sur le bouton ci-dessous.
      </DialogContentText>
    </StyledDialogContent>

    <StyledDialogActions>
      <Button variant="raised" href="/api/login" color="primary" autoFocus>
        Je me reconnecte
      </Button>
    </StyledDialogActions>
  </Dialog>
)

LoginAgainDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default LoginAgainDialog
