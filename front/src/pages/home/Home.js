import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import LinkButton from '../../components/Generic/LinkButton'
import PEConnectLink from '../../components/PEConnect/PEConnectLink'
import landingBackground from './images/landingBackground.svg'

const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 144rem;
  width: 100%;
  margin: auto;
`

const Header = styled.header`
  min-height: 36rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 5rem 15rem 0 10rem;
  background-image: url(${landingBackground});
  background-position: top right;
  background-repeat: no-repeat;
  background-size: contain;
  flex-wrap: wrap;
`

const HeaderMain = styled.div`
  max-width: 35rem;
`

const PEConnectLinkContainer = styled.div`
  flex-shrink: 0;
`

export const Home = ({ user }) => (
  <StyledHome>
    <Header>
      <HeaderMain>
        <Typography variant="display1">
          zen<span style={{ color: '#78E08F' }}>.</span>
        </Typography>
        <div
          style={{
            backgroundColor: '#78E08F',
            width: '2rem',
            height: '0.5rem',
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        />
        <Typography variant="title" style={{ marginTop: '3rem' }}>
          Actualisez-vous<br />en toute simplicité
        </Typography>
        <Typography style={{ marginTop: '3rem' }}>
          Vous êtes multi-employeur ?<br />
          L’actualisation n’est pas claire ou compliquée{' '}?
        </Typography>
        <Typography style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <b>
            Avec Zen la mise à jour de votre situation et l’envoi de vos
            documents sont plus clairs et simplifiés.
          </b>
        </Typography>
        <LinkButton to="/actu" disabled={!user} color="primary">
          {user ? `J'actualise ma situation` : `Connectez-vous pour commencer`}
        </LinkButton>
        <Typography variant="caption" style={{ marginTop: '2rem' }}>
          Propulsé par Pôle Emploi{' '}
          <span role="img" aria-label="Fusée">
            🚀
          </span>
        </Typography>
      </HeaderMain>
      <PEConnectLinkContainer>
        {!user && <PEConnectLink useDarkVersion />}
      </PEConnectLinkContainer>
    </Header>
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
