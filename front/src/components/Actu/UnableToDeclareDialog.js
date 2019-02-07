import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React from 'react'

import CustomDialog from '../Generic/CustomDialog'

const UnableToDeclareDialog = ({ isOpened }) => (
  <CustomDialog
    content={
      <DialogContentText>
        Vous ne pouvez accéder à Zen, car un problème nous empêche de récupérer
        les informations de votre statut de demandeur d'emploi.
        <br />
        Vous pouvez réessayer ultérieurement ou effectuer vos opérations sur{' '}
        <a
          href="https://www.pole-emploi.fr"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pole-Emploi.fr
        </a>.
      </DialogContentText>
    }
    actions={
      <Button
        variant="contained"
        href="/api/login/logout"
        target="_self"
        color="primary"
      >
        Je me déconnecte
      </Button>
    }
    title="Nous sommes désolés"
    titleId="UnableToDeclareDialogContentText"
    isOpened={isOpened}
    disableEscapeKeyDown
    disableBackdropClick
  />
)

UnableToDeclareDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default UnableToDeclareDialog
