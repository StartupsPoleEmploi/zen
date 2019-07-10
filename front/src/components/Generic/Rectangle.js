import PropTypes from 'prop-types'
import React from 'react'

import { primaryBlue } from '../../constants'

const Rectangle = ({ style }) => (
  <div
    style={{
      backgroundColor: primaryBlue,
      width: '2rem',
      height: '0.5rem',
      borderRadius: '0.2rem',
      ...style,
    }}
  />
)

Rectangle.propTypes = {
  style: PropTypes.object,
}

export default Rectangle
