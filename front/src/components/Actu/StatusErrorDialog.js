import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'

import CustomDialog from '../Generic/CustomDialog'

const StatusErrorDialog = ({ isOpened }) => (
  <CustomDialog
    content={
      <Fragment>
        {/*
          <DialogContentText style={{ marginBottom: '1rem' }}>
            Suite à un problème indépendant de notre volonté, Zen est actuellement
            indisponible.
          </DialogContentText>
          <DialogContentText style={{ marginBottom: '1rem' }}>
            En cas d'urgence, vous pouvez effectuer vos opérations sur
            Pole-Emploi.fr
          </DialogContentText>
          <DialogContentText style={{ marginBottom: '1rem' }}>
            N'hésitez pas à nous contacter si vous avez besoin d'assistance. Nous
            vous remercions de votre compréhension.
          </DialogContentText>
        */}

        {/* TODO: remove after the 21/09/2019  */}
        <DialogContentText style={{ marginBottom: '1rem' }}>
          Bonjour,
        </DialogContentText>
        <DialogContentText style={{ marginBottom: '1rem' }}>
          Pour des raisons techniques, le service sera indisponible du vendredi
          20 Septembre 20h au Samedi 21 Septembre.
        </DialogContentText>
        <DialogContentText style={{ marginBottom: '1rem' }}>
          Nous nous excusons pour la gêne occasionnée.
        </DialogContentText>
      </Fragment>
    }
    title="Nous sommes désolés"
    titleId="StatusErrorDialogContentText"
    isOpened={isOpened}
  />
)

StatusErrorDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
}

export default StatusErrorDialog
