import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'

import CustomDialog from '../Generic/CustomDialog'

const LoginErrorDialog = ({ isOpened, onCancel }) => (
  <CustomDialog
    content={
      <Fragment>
        <DialogContentText>
          Un problème technique indépendant de notre volonté est actuellement en
          cours et nous empêche de vous connecter à Zen. Il devrait être résolu
          d'ici quelques heures.
        </DialogContentText>
        <DialogContentText>
          En cas d'urgence, vous pouvez effectuer vos opérations sur
          Pole-Emploi.fr
        </DialogContentText>
        <DialogContentText>
          N'hésitez pas à nous contacter en cas de problème. Nous vous
          remercions de votre compréhension.
        </DialogContentText>
      </Fragment>
    }
    title="Nous sommes désolés"
    titleId="LoginErrorDialogContentText"
    isOpened={isOpened}
    onCancel={onCancel}
  />
)

LoginErrorDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default LoginErrorDialog
