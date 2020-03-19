import React from 'react'
import Link from '@material-ui/core/Link'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import ChevronRight from '@material-ui/icons/ChevronRight'

import AppTitle from '../../Generic/AppTitle'
import PeHelpLink from './PeHelpLink'
import { secondaryBlue, mobileBreakpoint } from '../../../constants'

const FooterContainer = styled.footer`
  background-color: ${secondaryBlue};
  width: 100vw;
  padding: 8rem 2rem;

  @media (max-width: ${mobileBreakpoint}) {
    padding: 0 0 10rem 0;
  }
`
const FooterContent = styled.div`
  width: 85rem;
  margin: auto;
  display: flex;

  @media (max-width: ${mobileBreakpoint}) {
    width: 100%;
    flex-direction: column;
  }
`

const Left = styled.div`
  display: flex;
  align-items: center;
  flex: 4;
  padding-right: 4rem;
  border-right: solid 1px #344370;

  @media (max-width: ${mobileBreakpoint}) {
    border-right: none;
    padding-right: 0;
  }
`
const Right = styled.div`
  flex: 5;
  padding-left: 4rem;

  @media (max-width: ${mobileBreakpoint}) {
    padding-left: 0;
  }
`

const Ul = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;

  @media (max-width: ${mobileBreakpoint}) {
    width: 100%;
    margin-bottom: 2rem;
  }
`
const Li = styled.li`
  padding: 1.5rem 0;

  @media (max-width: ${mobileBreakpoint}) {
    border-bottom: solid 1px #344370;
    padding: 2rem 0;
  }
`

const StyledLink = styled(Link)`
  && {
    color: #fff;
    text-decoration: none;
    display: grid;
    grid-template-columns: 1fr 5rem;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    @media (max-width: ${mobileBreakpoint}) {
      width: 70%;
      margin: auto;
    }
  }
`

function Footer() {
  return (
    <FooterContainer role="contentinfo">
      <FooterContent>
        <Left>
          <Ul>
            <Li>
              <StyledLink href="cgu">
                <Typography>Conditions Générales d'Utilisation</Typography>
                <span style={{ textAlign: 'right' }}>
                  <ChevronRight />
                </span>
              </StyledLink>
            </Li>
            <PeHelpLink />
          </Ul>
        </Left>
        <Right style={{ textAlign: 'center' }}>
          <AppTitle zenColor="#fff" />
          <br />
          <Typography
            variant="caption"
            // 0.51 (not 0.5) is the accessibility threshold for our background color
            style={{
              color: '#fff',
              opacity: 0.51,
              letterSpacing: 1.5,
              fontSize: '1.6rem',
            }}
          >
            Un service propulsé par Pôle emploi
          </Typography>
        </Right>
      </FooterContent>
    </FooterContainer>
  )
}

export default Footer
