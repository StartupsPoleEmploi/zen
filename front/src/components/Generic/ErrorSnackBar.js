import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Typography, Snackbar } from '@material-ui/core'
import WarningIcon from "../../images/WARNING.svg"
import { snackBarDuration } from '../../constants'

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
function ErrorSnackBar({ message, onHide, icon }) {
  const [isOpen, setIsOpen] = useState(true);

  const close = () => {
    if(onHide) {
      onHide()
    }

    setIsOpen(false)
  }

  return (
    <SnackbarWarning
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isOpen}
      autoHideDuration={snackBarDuration}
      onClose={close}
      onClick={close}
      message={<>
      <Logo src={icon || WarningIcon} />
      <Typography>{message}</Typography>
      </>
      }
    />
  )
}

ErrorSnackBar.propTypes = {
  message: PropTypes.object.isRequired,
  onHide: PropTypes.func,
  icon: PropTypes.object
}

export default ErrorSnackBar;
