import PropTypes from 'prop-types'
import React from 'react'

const GREEN = '#39679e'

const Rectangle = ({ style }) => (
  <div
    style={{
      backgroundColor: GREEN,
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
