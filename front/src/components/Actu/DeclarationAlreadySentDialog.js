import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'

import CustomColorButton from '../Generic/CustomColorButton'
import CustomDialog from '../Generic/CustomDialog'

const DeclarationAlreadySentDialog = ({ isOpened, onCancel }) => (
  <CustomDialog
    content={
      <Fragment>
        <DialogContentText gutterBottom>
          Vous avez déjà envoyé votre actualisation ce mois-ci en passant
          directement par{' '}
          <a href="https://www.pole-emploi.fr" style={{ whiteSpace: 'nowrap' }}>
            Pole-emploi.fr
          </a>
          .
        </DialogContentText>
        <DialogContentText gutterBottom>
          Vous ne pouvez donc utiliser Zen pour votre actualisation ce mois-ci.
        </DialogContentText>
        <DialogContentText>
          Vous pouvez cependant accéder à l'interface d'envoi de documents s'il
          vous en reste d'anciens à envoyer.
        </DialogContentText>
      </Fragment>
    }
    title="Vous avez déjà envoyé votre actualisation"
    titleId="DeclarationAlreadySentDialogContentText"
    isOpened={isOpened}
    onCancel={onCancel}
    actions={
      <Fragment>
        <CustomColorButton onClick={onCancel}>
          Voir les documents
        </CustomColorButton>
        <Button
          variant="contained"
          href="https://www.pole-emploi.fr"
          target="_self"
          color="primary"
        >
          J'accède à Pole-emploi.fr
        </Button>
      </Fragment>
    }
  />
)

DeclarationAlreadySentDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default DeclarationAlreadySentDialog
