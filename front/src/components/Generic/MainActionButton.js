import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { primaryBlue } from '../../constants'

const BaseButton = styled(Button).attrs({
  color: 'primary',
})`
  && {
    padding: 1rem 0.5rem;
    margin: 0 0.5rem;
    width: 17.5rem;
    height: 7.5rem;
    text-transform: uppercase;
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

const SecondaryButton = styled(BaseButton).attrs({})`
  && {
    color: black;
    &:hover {
      color: ${primaryBlue};
    }
  }
`

const MainActionButton = ({ children, primary = true, ...props }) =>
  primary ? (
    <PrimaryButton {...props}>{children}</PrimaryButton>
  ) : (
    <SecondaryButton color="default" {...props}>
      {children}
    </SecondaryButton>
  )

MainActionButton.propTypes = {
  children: PropTypes.node.isRequired,
  primary: PropTypes.bool.isRequired,
}

export default MainActionButton
