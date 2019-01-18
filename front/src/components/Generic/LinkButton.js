import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'

const LinkButton = ({ children, to, ...props }) => (
  <Button
    component={(childProps) => <Link to={to} {...childProps} />}
    variant="contained"
    {...props}
  >
    {children}
  </Button>
)

LinkButton.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
}

export default LinkButton
