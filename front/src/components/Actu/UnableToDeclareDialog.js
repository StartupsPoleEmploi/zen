import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React from 'react'

import CustomDialog from '../Generic/CustomDialog'

const UnableToDeclareDialog = ({ isOpened }) => (
  <CustomDialog
    content={
      <DialogContentText>
        Vous ne pouvez accéder à Zen, car nous ne pouvons récupérer
        d'informations au sujet de votre statut de demandeur d'emploi.
        <br />
        Merci d'effectuer vos opérations sur{' '}
        <a href="https://www.pole-emploi.fr">Pole-Emploi.fr</a>.
      </DialogContentText>
    }
    actions={
      <Button
        variant="raised"
        href="https://www.pole-emploi.fr"
        target="_self"
        color="primary"
      >
        J'accède à Pole-Emploi.fr
      </Button>
    }
    title="Nous sommes désolés"
    titleId="UnableToDeclareDialogContentText"
    isOpened={isOpened}
    disableEscapeKeyDown
    disableBackdropClick
    fullScreen
  />
)

UnableToDeclareDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default UnableToDeclareDialog
