import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import LinkButton from '../../components/Generic/LinkButton'
import PEConnectLink from '../../components/PEConnect/PEConnectLink'

const StyledHome = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 30rem;
`

const LandingText = styled(Typography)`
  padding: 4rem 0;
`

const StyledTitle = styled(Typography)`
  padding-bottom: 1rem;
`

export const Home = ({ user }) => (
  <StyledHome>
    {!user ? (
      <Fragment>
        <LandingText color="inherit" variant="headline">
          Il n'a jamais été aussi simple de faire son actualisation
        </LandingText>
        <StyledTitle variant="title">Connectez-vous pour commencer</StyledTitle>
        <PEConnectLink />
      </Fragment>
    ) : (
      <LinkButton to="/actu">Commencer ma première actualisation</LinkButton>
    )}
  </StyledHome>
)

Home.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
  }),
}

export default Home
