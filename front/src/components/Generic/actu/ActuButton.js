import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import withWidth from '@material-ui/core/withWidth'

import DashbordMainBt from '../DashbordMainBt'

const Bt = styled(DashbordMainBt)`
  && {
    width: 100%;
    max-width: 40rem;
    margin: ${({ width }) => {
      if (['xs', 'sm', 'md'].includes(width)) return '2rem auto 0 auto'
      return '2rem auto 0 3rem'
    }};
  }
`

function ActuButton({ width, ...props }) {
  return (
    <>
      <div style={{ margin: "0rem -2rem", backgroundColor: "#fff", height: '0.5rem' }} />
      <Bt width={width} {...props} >
        Je m'actualise
      </Bt>
    </>
  )
}

ActuButton.propTypes = {
  width: PropTypes.string.isRequired,
}

export default withWidth()(ActuButton)