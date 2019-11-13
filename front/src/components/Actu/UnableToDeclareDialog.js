import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

import CustomDialog from '../Generic/CustomDialog'
import CustomColorButton from '../Generic/CustomColorButton'

const UnableToDeclareDialog = ({ onCancel, isOpened, currentPath }) => (
  <CustomDialog
    content={
      <Fragment>
        <DialogContentText gutterBottom>
          Vous ne pouvez accéder à l'actualisation via Zen, car un problème nous
          empêche actuellement de récupérer les informations de votre statut de
          demandeur d'emploi.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Vous pouvez réessayer ultérieurement ou effectuer vos opérations sur{' '}
          <a
            href="https://www.pole-emploi.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pole-Emploi.fr
          </a>
          .
        </DialogContentText>
        <DialogContentText>
          Vous pouvez cependant accéder à l'interface d'envoi de documents s'il
          vous en reste d'anciens à envoyer.
        </DialogContentText>
      </Fragment>
    }
    actions={
      <Fragment>
        {currentPath === '/files' ? (
          <CustomColorButton onClick={onCancel}>
            Voir mes documents
          </CustomColorButton>
        ) : (
          <CustomColorButton to="/files" onClick={onCancel} component={Link}>
            Voir mes documents
          </CustomColorButton>
        )}
        <Button
          variant="contained"
          href="/api/login/logout"
          target="_self"
          color="primary"
        >
          Je me déconnecte
        </Button>
      </Fragment>
    }
    title="Attention"
    titleId="UnableToDeclareDialogContentText"
    isOpened={isOpened}
    onCancel={onCancel}
  />
)

UnableToDeclareDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentPath: PropTypes.func.isRequired,
}

export default UnableToDeclareDialog
