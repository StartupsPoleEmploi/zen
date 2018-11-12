import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import CustomColorButton from '../Generic/CustomColorButton'

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

const DeclarationAlreadySentDialog = ({ isOpened, onCancel }) => (
  <Dialog
    open={isOpened}
    onClose={onCancel}
    aria-labelledby="DeclarationAlreadySentDialogContentText"
  >
    <StyledDialogTitle>
      Vous avez déjà envoyé votre actualisation
    </StyledDialogTitle>
    <StyledDialogContent>
      <DialogContentText id="DeclarationAlreadySentDialogContentText">
        Vous avez déjà envoyé votre actualisation ce mois-ci en passant
        directement par{' '}
        <a href="https://www.pole-emploi.fr" style={{ whiteSpace: 'nowrap' }}>
          Pole-Emploi.fr
        </a>.
        <br />
        Vous ne pouvez donc utiliser Zen pour votre actualisation ce mois-ci.
        <br />
        Vous pouvez cependant accéder à l'interface d'envoi de documents s'il
        vous en reste d'anciens à envoyer.
      </DialogContentText>
    </StyledDialogContent>
    <StyledDialogActions>
      <CustomColorButton onClick={onCancel}>Fermer</CustomColorButton>
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

DeclarationAlreadySentDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default DeclarationAlreadySentDialog
