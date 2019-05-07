import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { primaryBlue } from '../../constants/colors'

const BaseButton = styled(Button).attrs({
  color: 'primary',
})`
  && {
    padding: 1rem 3rem;
    margin: 0 0.5rem;
    width: 17.5rem;
    height: 6.5rem;
  }
`

const PrimaryButton = styled(BaseButton).attrs({
  variant: 'contained',
})`
  && {
    &:disabled {
      color: #fff;
      background-color: rgba(
        0,
        101,
        219,
        0.5
      ); /* rgb(0,101,219) is our primary color, #0065DB */
    }
  }
`

const SecondaryButton = styled(BaseButton).attrs({
  variant: 'outlined',
})`
  && {
    color: #000;
    border: solid 2px ${primaryBlue};
    &:hover,
    &:focus {
      border: solid 2px ${primaryBlue};
    }
  }
`

const MainActionButton = ({ children, primary = true, ...props }) =>
  primary ? (
    <PrimaryButton {...props}>{children}</PrimaryButton>
  ) : (
    <SecondaryButton {...props}>{children}</SecondaryButton>
  )

MainActionButton.propTypes = {
  children: PropTypes.node.isRequired,
  primary: PropTypes.bool.isRequired,
}

export default MainActionButton
