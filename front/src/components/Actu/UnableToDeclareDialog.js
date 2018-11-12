import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
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

const UnableToDeclareDialog = ({ isOpened }) => (
  <Dialog
    open={isOpened}
    disableEscapeKeyDown
    disableBackdropClick
    aria-labelledby="UnableToDeclareDialogContentText"
    fullScreen
  >
    <StyledDialogTitle>Nous sommes désolés</StyledDialogTitle>
    <StyledDialogContent>
      <DialogContentText id="UnableToDeclareDialogContentText">
        Vous ne pouvez accéder à Zen, car nous ne pouvons récupérer
        d'informations au sujet de votre statut de demandeur d'emploi.
        <br />
        Merci d'effectuer vos opérations sur{' '}
        <a href="https://www.pole-emploi.fr">Pole-Emploi.fr</a>.
      </DialogContentText>
    </StyledDialogContent>
    <StyledDialogActions>
      <Button
        variant="raised"
        href="https://www.pole-emploi.fr"
        target="_self"
        color="primary"
      >
        J'accède à Pole-Emploi.fr
      </Button>
    </StyledDialogActions>
  </Dialog>
)

UnableToDeclareDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default UnableToDeclareDialog
