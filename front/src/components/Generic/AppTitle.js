import React from 'react'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import withWidth from '@material-ui/core/withWidth'
import PropTypes from 'prop-types'

import { primaryBlue } from '../../constants'

const StyledTitle = styled(Typography).attrs({
  variant: 'h2',
  component: 'div',
})`
  && {
    font-family: filson-soft;
    color: #000;
    font-weight: bold;
    padding-right: 1.5rem;
  }
`

const HomeLink = styled(Link)`
  && {
    text-decoration: none;
    font-family: filson-soft;
  }
`

export const AppTitle = ({ zenColor = '#000', ...props }) => (
  <StyledTitle {...props}>
    <HomeLink
      style={{ color: zenColor }}
      to="/dashboard"
      title="Retourner à l'accueil du site"
    >
      zen<span style={{ color: primaryBlue }}>.</span>
    </HomeLink>
  </StyledTitle>
)

AppTitle.propTypes = {
  zenColor: PropTypes.string,
}

export default withWidth()(AppTitle)
