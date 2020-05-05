import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined'
import { connect } from 'react-redux'

import { mobileBreakpoint, helpColor } from '../../constants'
import { openHelpPopup } from '../../redux/actions/helpPopup'

const A = styled.button`
  position: fixed;
  right: 2rem;
  bottom: 2rem;

  display: flex;
  align-items: center;
  white-space: no-wrap;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;

  background-color: ${helpColor} !important;
  color: white;
  padding: 1rem 1.6em;
  border-radius: 999rem;
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 10;

  @media (max-width: ${mobileBreakpoint}) {
    bottom: 9rem;
    padding: 1rem;
    justify-content: center;
    width: 45px;
    height: 45px;
  }
`

const HelpText = styled.span`
  @media (max-width: ${mobileBreakpoint}) {
    position: absolute;
    left: -10000px;
    top: -10000px;
  }
`

const Help = styled(HelpOutlineOutlined)`
  margin-right: 0.5rem;
  font-size: 2rem !important;

  @media (max-width: ${mobileBreakpoint}) {
    margin: 0;
  }
`

function HelpLink({onClick}) {
  return (
    <A
      onClick={onClick}
      title="Consulter notre page d'aide"
    >
      <Help />
      <HelpText>Aide</HelpText>
    </A>
  )
}

HelpLink.propTypes = {
  onClick: PropTypes.func,
}

export default connect(
  (state) => ({
    isOpened: state.helpPopup.isOpen,
  }),
  {
    onClick: openHelpPopup,
  },
)(HelpLink)
