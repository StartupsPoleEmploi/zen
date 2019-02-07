import Typography from '@material-ui/core/Typography'
import React from 'react'
import styled from 'styled-components'

const BLUE = '#39679e'

const StyledTitle = styled(Typography).attrs({
  variant: 'h4',
})`
  && {
    color: #000;
    font-weight: bold;
    padding-right: 1.5rem;
  }
`

export const AppTitle = ({ ...props }) => (
  <StyledTitle {...props}>
    zen<span style={{ color: BLUE }}>.</span>
  </StyledTitle>
)

export default AppTitle
