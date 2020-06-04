import React from 'react'
import ErrorSnackBar from './ErrorSnackBar'
import SuccessIcon from '../../images/CHECK.svg'


// eslint-disable-next-line react/prop-types
function SuccessSnackBar(props) {
  return (
    <ErrorSnackBar {...props}
    icon={SuccessIcon}
    />
  )
}

SuccessSnackBar.propTypes = {
}

export default SuccessSnackBar;
