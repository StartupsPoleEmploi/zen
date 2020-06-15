import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '../../images/WARNING.svg';
import { snackBarDuration } from '../../constants';

const Logo = styled.img`
  margin-right: 10px;
`;

const Close = styled(CloseIcon)`
  margin-left: 1rem;
`;

const SnackbarWarning = styled(Snackbar)`
  > div { 
    cursor: pointer;
    background-color: #F3F3F3; 

    > div {
      display: flex;
      flex-direction: row;
      color: black;
    }
  } 
`;

function ErrorSnackBar({
  message, onHide, icon, duraction, closeIcon,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const close = () => {
    if (onHide) {
      onHide();
    }

    setIsOpen(false);
  };

  return (
    <SnackbarWarning
      className="snackbar"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isOpen}
      autoHideDuration={duraction !== undefined ? duraction : snackBarDuration}
      onClose={close}
      onClick={close}
      message={(
        <>
          <Logo src={icon || WarningIcon} />
          <Typography>{message}</Typography>
          {closeIcon && <Close />}
        </>
)}
    />
  );
}

ErrorSnackBar.propTypes = {
  message: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  onHide: PropTypes.func,
  closeIcon: PropTypes.func,
  icon: PropTypes.object,
  duraction: PropTypes.number,
};

export default ErrorSnackBar;
