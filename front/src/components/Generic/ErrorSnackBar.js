import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Typography, Snackbar } from '@material-ui/core'
import WarningIcon from "../../images/WARNING.svg";
import { snackBarDuration } from '../../constants';

const Logo = styled.img`
  margin-right: 10px;
`

const SnackbarWarning = styled(Snackbar)`
  > div { 
    background-color: #F3F3F3; 

    > div {
      display: flex;
      flex-direction: row;
      color: black;
    }
  } 
`


// eslint-disable-next-line react/prop-types
function ErrorSnackBar({ message }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SnackbarWarning
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isOpen}
      autoHideDuration={snackBarDuration}
      onClose={() => setIsOpen(false)}
      onClick={() => setIsOpen(false)}
      message={<>
      <Logo src={WarningIcon} />
      <Typography>{message}</Typography>
      </>
      }
    />
  )
}

ErrorSnackBar.propTypes = {
  message: PropTypes.object.isRequired,
}

export default ErrorSnackBar;
