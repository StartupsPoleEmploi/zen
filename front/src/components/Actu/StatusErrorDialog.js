import DialogContentText from '@material-ui/core/DialogContentText';
import PropTypes from 'prop-types';
import React from 'react';

import CustomDialog from '../Generic/CustomDialog';

const StatusErrorDialog = ({ isOpened }) => (
  <CustomDialog
    content={(
      <>
        <DialogContentText style={{ marginBottom: '1rem' }}>
          Suite à un problème indépendant de notre volonté, Zen est actuellement
          indisponible.
        </DialogContentText>
        <DialogContentText style={{ marginBottom: '1rem' }}>
          En cas d'urgence, vous pouvez effectuer vos opérations sur
          Pole-emploi.fr
        </DialogContentText>
        <DialogContentText style={{ marginBottom: '1rem' }}>
          N'hésitez pas à nous contacter si vous avez besoin d'assistance. Nous
          vous remercions de votre compréhension.
        </DialogContentText>
      </>
    )}
    title="Nous sommes désolés"
    titleId="StatusErrorDialogContentText"
    isOpened={isOpened}
  />
);

StatusErrorDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
};

export default StatusErrorDialog;
