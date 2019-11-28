import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'

export function H1({ children, ...rest }) {
  return (
    <Typography variant="h1" {...rest}>
      {children}
    </Typography>
  )
}
H1.propTypes = { children: PropTypes.node.isRequired }

export function H2({ children, ...rest }) {
  return (
    <Typography variant="h2" {...rest}>
      {children}
    </Typography>
  )
}
H2.propTypes = { children: PropTypes.node.isRequired }

export function H3({ children, ...rest }) {
  return (
    <Typography variant="h3" {...rest}>
      {children}
    </Typography>
  )
}
H3.propTypes = { children: PropTypes.node.isRequired }

export function H4({ children, ...rest }) {
  return (
    <Typography variant="h4" {...rest}>
      {children}
    </Typography>
  )
}
H4.propTypes = { children: PropTypes.node.isRequired }
