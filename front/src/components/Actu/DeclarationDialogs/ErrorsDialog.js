import React from 'react';
import PropTypes from 'prop-types';

import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';

import CustomColorButton from '../../Generic/CustomColorButton';
import CustomDialog from '../../Generic/CustomDialog';

const ErrorsDialog = ({ validationErrors, onCancel, ...props }) => (
  <CustomDialog
    content={(
      <>
        <DialogContentText>
          Notre système a détecté des erreurs dans votre déclaration :
        </DialogContentText>
        <ul style={{ padding: 0 }}>
          {validationErrors.map((error) => (
            <DialogContentText component="li" key={error}>
              {error}
            </DialogContentText>
          ))}
        </ul>
        <DialogContentText>
          Zen n'est pas en mesure de prendre en charge votre déclaration.
          Veuillez la modifier, ou l'effectuer sur Pole-emploi.fr
        </DialogContentText>
      </>
    )}
    actions={(
      <>
        <CustomColorButton color="primary" onClick={onCancel}>
          Je modifie ma déclaration
        </CustomColorButton>
        <Button
          variant="contained"
          href="https://www.pole-emploi.fr"
          target="_self"
          color="primary"
        >
          J'accède à Pole-Emploi.fr
        </Button>
      </>
    )}
    {...props}
  />
);

ErrorsDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  validationErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
  props: PropTypes.object.isRequired,
};

export default ErrorsDialog;
