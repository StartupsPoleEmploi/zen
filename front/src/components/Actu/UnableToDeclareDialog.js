import Button from '@material-ui/core/Button'
import styled from 'styled-components'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

import CloseIcon from '@material-ui/icons/Close'

import CustomDialog from '../Generic/CustomDialog'
import CustomColorButton from '../Generic/CustomColorButton'

const TopDialogActions = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`

const UnableToDeclareDialog = ({ onCancel, isOpened, currentPath }) => (
  <CustomDialog
    role="alertdialog"
    header={
      <TopDialogActions>
        <Button
          onClick={onCancel}
          className="bt-close"
          title="Fermer la fenêtre"
        >
          <CloseIcon />
        </Button>
      </TopDialogActions>
    }
    content={
      <Fragment>
        <DialogContentText gutterBottom>
          Vous ne pouvez accéder à l'actualisation via Zen, car un problème
          technique nous empêche actuellement de récupérer les informations de
          votre statut de demandeur d'emploi.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Vous pouvez réessayer ultérieurement ou effectuer vos opérations sur{' '}
          <a
            href="https://www.pole-emploi.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            pole-emploi.fr
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
            Gérer mes justificatifs
          </CustomColorButton>
        ) : (
          <CustomColorButton to="/files" onClick={onCancel} component={Link}>
            Gérer mes justificatifs
          </CustomColorButton>
        )}
      </Fragment>
    }
    title="Problème technique"
    titleId="UnableToDeclareDialogContentText"
    isOpened={isOpened}
    onCancel={onCancel}
  />
)

UnableToDeclareDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentPath: PropTypes.string.isRequired,
}

export default UnableToDeclareDialog
