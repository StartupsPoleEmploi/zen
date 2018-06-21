import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import LinkButton from '../../components/Generic/LinkButton'
import PEConnectLink from '../../components/PEConnect/PEConnectLink'
import landingBackground from './images/landingBackground.svg'
import logoPE from './images/logoPE.jpg'
import step1ToStep2 from './images/step1-to-step2.svg'
import step1 from './images/step1.jpg'
import step2ToStep3 from './images/step2-to-step3.svg'
import step2 from './images/step2.jpg'
import step3 from './images/step3.jpg'

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

const StepsContainer = styled.div`
  margin-top: 7.5rem;
  text-align: center;
  width: 80rem;
`

const Step = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StepImg = styled.img`
  width: 35rem;
  height: auto;
`

const IntermediateImg = styled.img`
  margin-bottom: -5rem;
  position: relative;
`

const FooterImg = styled.img`
  display: block;
  margin: 15rem auto 4rem;
  width: 12rem;
  height: auto;
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
    <StepsContainer>
      <Typography variant="title">Seulement 3 étapes !</Typography>
      <Step>
        <StepImg src={step1} alt="Étape 1" />
        <div>
          <Typography variant="title" gutterBottom>
            Mise à jour de ma situation
          </Typography>
          <Typography style={{ width: '30rem' }}>
            J’actualise ma situation en fonction de chaque employeur.!
          </Typography>
        </div>
      </Step>
      <IntermediateImg src={step1ToStep2} alt="" />
      <Step>
        <div>
          <Typography variant="title" gutterBottom>
            Envoi simple et rapide
          </Typography>
          <Typography style={{ width: '30rem' }}>
            On me dit les documents que je dois envoyer.
          </Typography>
        </div>
        <StepImg src={step2} alt="Étape 2" />
      </Step>
      <IntermediateImg src={step2ToStep3} alt="" />
      <Step>
        <StepImg src={step3} alt="Étape 3" />
        <div>
          <Typography variant="title" gutterBottom>
            Indemnisation sans erreur
          </Typography>
          <Typography style={{ width: '30rem' }}>
            Je suis payé le bon montant, au bon moment.
          </Typography>
        </div>
      </Step>
    </StepsContainer>
    <footer>
      <FooterImg src={logoPE} alt="" />
    </footer>
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
