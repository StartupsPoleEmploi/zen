import React from 'react';

import DialogContentText from '@material-ui/core/DialogContentText';
import CircularProgress from '@material-ui/core/CircularProgress';

import CustomDialog from '../../Generic/CustomDialog';

const LoadingDialog = (props) => (
  <CustomDialog
    content={(
      <>
        <CircularProgress />
        <DialogContentText>Envoi en cours…</DialogContentText>
      </>
    )}
    disableEscapeKeyDown
    disableBackdropClick
    {...props}
  />
);

export default LoadingDialog;
