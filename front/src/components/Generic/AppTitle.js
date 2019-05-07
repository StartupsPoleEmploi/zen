import Typography from '@material-ui/core/Typography'
import React from 'react'
import styled from 'styled-components'

import { primaryBlue } from '../../constants/colors'

const StyledTitle = styled(Typography).attrs({
  variant: 'h4',
  component: 'div',
})`
  && {
    color: #000;
    font-weight: bold;
    padding-right: 1.5rem;
  }
`

export const AppTitle = ({ ...props }) => (
  <StyledTitle {...props}>
    zen<span style={{ color: primaryBlue }}>.</span>
  </StyledTitle>
)

export default AppTitle
