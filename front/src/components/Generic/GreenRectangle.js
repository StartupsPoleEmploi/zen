import PropTypes from 'prop-types'
import React from 'react'

const GREEN = '#7cdd91'

const GreenRectangle = ({ style }) => (
  <div
    style={{
      backgroundColor: GREEN,
      width: '2rem',
      height: '0.5rem',
      ...style,
    }}
  />
)

GreenRectangle.propTypes = {
  style: PropTypes.object,
}

export default GreenRectangle
