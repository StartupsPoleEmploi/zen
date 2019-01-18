import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import AppTitle from '../../components/Generic/AppTitle'
import LinkButton from '../../components/Generic/LinkButton'
import Rectangle from '../../components/Generic/Rectangle'
import PEConnectLink from '../../components/PEConnect/PEConnectLink'
import landingBackground from '../../images/landingBackground.svg'
import logoPE from '../../images/logoPE.jpg'
import step1ToStep2 from '../../images/step1-to-step2.svg'
import step1 from '../../images/people.svg'
import step2ToStep3 from '../../images/step2-to-step3.svg'
import step2 from '../../images/paper-plane.svg'
import step3 from '../../images/money-bank.svg'

const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 144rem;
  width: 100%;
  margin: auto;
`

const LoginError = styled.div`
  padding: 1rem;
  background-color: #f57264;
  width: 100%;
  text-align: center;
`

const Header = styled.header`
  min-height: 71rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-image: url(${landingBackground});
  background-position: top right;
  background-repeat: no-repeat;
  background-size: contain;
  flex-wrap: wrap-reverse;
  padding: 5rem 10rem 0;

  @media (max-width: 42rem) {
    padding: 5rem 2rem 0;
  }
`

const HeaderMain = styled.div`
  max-width: 50rem;
`

const Tagline = styled(Typography).attrs({
  variant: 'h6',
})`
  && {
    font-size: 3.6rem;
    margin-bottom: 3rem;
  }
`

const BodyTypography = styled(Typography).attrs({ variant: 'body1' })`
  && {
    font-size: 2rem;
  }
`

const BigLinkButton = styled(LinkButton).attrs({ color: 'primary' })`
  && {
    width: 100%;
    max-width: 38.4rem;
    height: 6.4rem;
    font-size: 2.2rem;
  }
`

const Caption = styled(Typography).attrs({ variant: 'caption' })`
  && {
    margin-top: 2rem;
    width: 100%;
    max-width: 38.4rem;
    text-align: center;
    font-size: 1.8rem;
  }
`

const PEConnectLinkContainer = styled.div`
  margin-right: 5rem;
  flex-shrink: 0;
`

const StepsContainer = styled.div`
  margin-top: 7.5rem;
  padding: 0 10rem;
  text-align: center;
  max-width: 100rem;
  width: 100%;

  @media (max-width: 42rem) {
    padding: 0 2rem;
  }
`

const Step = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`

const StepTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
  flex-grow: 1;
  flex-shrink: 0;
`

const StepTitle = styled(Typography).attrs({
  variant: 'subtitle1',
  gutterBottom: true,
})`
  && {
    font-size: 2.8rem;
    font-weight: bold;
  }
`

const StepText = styled(Typography).attrs({ variant: 'body1' })`
  && {
    font-size: 2rem;
    width: 30rem;
  }
`

const StepImg = styled.img`
  max-width: 35rem;
  width: 100%;
  min-width: 22.2rem;
  height: auto;
  flex-shrink: 1;
`

const IntermediateImg = styled.img`
  margin-bottom: -5rem;
`

const FooterImg = styled.img`
  display: block;
  margin: 15rem auto 4rem;
  width: 12rem;
  height: auto;
`

export const Home = ({ location: { search } }) => (
  <StyledHome>
    {search === '?loginFailed' && (
      <LoginError>
        <BodyTypography>
          La connexion a échoué, merci de bien vouloir réessayer ultérieurement.
        </BodyTypography>
      </LoginError>
    )}
    <Header>
      <HeaderMain>
        <AppTitle />
        <Rectangle
          style={{
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        />
        <Tagline>
          Actualisez-vous<br />en toute simplicité
        </Tagline>
        <BodyTypography>
          Vous avez plusieurs employeurs ?<br />
          L’actualisation n’est pas claire ou compliquée{' '}?
        </BodyTypography>
        <BodyTypography style={{ marginTop: '3rem', marginBottom: '6rem' }}>
          <b>
            Avec Zen la mise à jour de votre situation et l’envoi de vos
            documents sont plus clairs et simplifiés.
          </b>
        </BodyTypography>
        <BigLinkButton to="/api/login" target="_self">
          J'actualise ma situation
        </BigLinkButton>
        <Caption>
          Propulsé par Pôle Emploi{' '}
          <span role="img" aria-label="Fusée">
            🚀
          </span>
        </Caption>
      </HeaderMain>
      <PEConnectLinkContainer>
        <PEConnectLink useDarkVersion />
      </PEConnectLinkContainer>
    </Header>

    <StepsContainer>
      <Tagline>Seulement 3 étapes !</Tagline>
      <Step>
        <StepImg src={step1} alt="Étape 1" />
        <StepTextContainer>
          <StepTitle>Mise à jour de ma situation</StepTitle>
          <StepText>
            J’actualise ma situation en fonction de chaque employeur.
          </StepText>
        </StepTextContainer>
      </Step>
      <IntermediateImg src={step1ToStep2} alt="" />
      <Step style={{ flexWrap: 'wrap-reverse' }}>
        <StepTextContainer>
          <StepTitle>Envoi simple et rapide</StepTitle>
          <StepText>On me dit les documents que je dois envoyer.</StepText>
        </StepTextContainer>
        <StepImg src={step2} alt="Étape 2" />
      </Step>
      <IntermediateImg src={step2ToStep3} alt="" />
      <Step>
        <StepImg src={step3} alt="Étape 3" />
        <StepTextContainer>
          <StepTitle>Indemnisation sans erreur</StepTitle>
          <StepText>Je suis payé le bon montant, au bon moment.</StepText>
        </StepTextContainer>
      </Step>
    </StepsContainer>

    <footer>
      <FooterImg src={logoPE} alt="" />
    </footer>
  </StyledHome>
)

Home.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }),
}

export default Home
