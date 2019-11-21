import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'

const Container = styled.div`
  position: relative;
  height: 50px;
  width: 50px;
`
const StyledValue = styled(Typography)`
  && {
    position: absolute;
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    justify-content: center;
    font-size: 1.4rem;
    top: 0;
  }
`

export const CircleJauge = ({ percentage }) => (
  <Container>
    <CircularProgress variant="static" size={50} value={percentage} />
    <StyledValue className="declaration-completion">{percentage}%</StyledValue>
  </Container>
)

CircleJauge.propTypes = {
  percentage: PropTypes.number.isRequired,
}

export default CircleJauge
