import React from 'react'
import styled from 'styled-components'
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined'

import { mobileBreakpoint, helpColor } from '../../constants'

const A = styled.a`
  position: fixed;
  right: 2rem;
  bottom: 2rem;

  display: flex;
  align-items: center;
  white-space: no-wrap;
  font-family: inherit;
  text-decoration: none;

  background-color: ${helpColor} !important;
  color: white;
  padding: 1rem 1.6em;
  border-radius: 999rem;
  font-size: 1.5rem;
  font-weight: bold;

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

function HelpLink() {
  return (
    <A
      href="https://pole-emploi.zendesk.com/hc/fr"
      title="Consulter notre page d'aide"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Help />
      <HelpText>Aide</HelpText>
    </A>
  )
}

export default HelpLink
