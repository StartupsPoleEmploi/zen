import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import CustomColorButton from '../../components/Generic/CustomColorButton'

const StyledDialogContent = styled(DialogContent)`
  && {
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

const DeclarationDialog = ({ isOpened, onCancel, onConfirm }) => (
  <Dialog
    open={isOpened}
    onClose={onCancel}
    aria-labelledby="ActuDialogContentText"
  >
    <StyledDialogTitle>Envoi de l'actualisation</StyledDialogTitle>
    <StyledDialogContent>
      <DialogContentText id="ActuDialogContentText">
        Votre actualisation va être envoyée à Pôle-Emploi.
        <br />
        Nous vous envoyons un e-mail pour vous le confirmer.
      </DialogContentText>
    </StyledDialogContent>
    <StyledDialogActions>
      <CustomColorButton onClick={onCancel} color="primary">
        Je n'ai pas terminé
      </CustomColorButton>
      <Button variant="raised" onClick={onConfirm} color="primary" autoFocus>
        Je m'actualise
      </Button>
    </StyledDialogActions>
  </Dialog>
)

DeclarationDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default DeclarationDialog
