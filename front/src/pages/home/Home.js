import Typography from '@material-ui/core/Typography'
import Check from '@material-ui/icons/Check'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import AppTitle from '../../components/Generic/AppTitle'
import LinkButton from '../../components/Generic/LinkButton'
import YoutubeVideo from '../../components/Generic/YoutubeVideo'
import landingBackground from '../../images/landingBackground.svg'
import step3 from '../../images/paper-plane.svg'
import step2 from '../../images/people.svg'
import step1ToStep2 from '../../images/step1-to-step2.svg'
import step2ToStep3 from '../../images/step2-to-step3.svg'
import step1 from '../../images/woman-holding-phone.svg'
import youtubeVideoThumb from '../../images/youtube-video-thumbnail.jpg'

const lightBlue = '#0076FF'
const darkBlue = '#1E2C59'

const windowWidthElement = `
  width: 100vw;
  left: 50%;
  margin-left: -50vw;
  position: relative;
`

const StyledHome = styled.div`
  max-width: 144rem;
  margin: auto;
  padding: 5rem 10rem 0;
  @media (max-width: 42rem) {
    padding: 5rem 2rem 0;
  }
`

const LoginError = styled.div`
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #f57264;
  width: 100%;
  text-align: center;
  margin-top: -5rem;

  ${windowWidthElement}
`

const LogosContainer = styled.div`
  display: flex;
  align-items: flex-end;
  padding-bottom: 4rem;

  @media (max-width: 60rem) {
    justify-content: center;
    align-items: center;
  }
`

const HeaderMain = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 2rem;

  @media (max-width: 60rem) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
`

const Tagline = styled(Typography).attrs({
  variant: 'h3',
  component: 'h1',
})`
  && {
    margin-bottom: 3rem;
    font-weight: bold;
    text-transform: uppercase;
  }
`

const ConnectButton = styled(LinkButton).attrs({ color: 'secondary' })`
  && {
    width: 40rem;
    max-width: 100%;
    height: 6.4rem;
    font-size: 2.2rem;
    border-radius: 3rem;
    margin-bottom: 2rem;
  }
`

const WhiteConnectButton = styled(ConnectButton)`
  && {
    background-color: #fff;
    color: #000;
  }
`

const GreenCheck = styled(Check)`
  && {
    color: green;
    width: 3rem;
    height: 3rem;
  }
`

const Section = styled.section``

const SectionTitle = styled(Typography).attrs({
  variant: 'h5',
  component: 'h2',
})`
  && {
    font-weight: bold;
    padding-bottom: 3rem;
  }
`

const FlexSection = styled(Section)`
  display: flex;
  margin-left: -10rem;
  margin-right: -10rem;

  @media (max-width: 60rem) {
    flex-direction: column;
    margin-left: -2rem;
    margin-right: -2rem;
  }
`

const FlexSectionReverse = styled(FlexSection)`
  flex-direction: row-reverse;
`

const SectionHalfContainer = styled.div`
  flex: 0 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 5rem;
`

const SectionHalfContainerWithBg = styled(SectionHalfContainer)`
  min-height: 35rem;
`

const StepsContainer = styled.div`
  display: flex;

  @media (max-width: 60rem) {
    flex-direction: column;
  }
`

const Step = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const StepTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
  flex-grow: 0;
  flex-shrink: 0;
  width: 22rem;
  padding: 3rem;
`

const StepImg = styled.img`
  max-height: 15rem;
  width: auto;
  height: auto;
  flex-shrink: 1;
`

const TestimoniesContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`
const TestimonyContainer = styled.div`
  flex: 0 0 25rem;
  border: 1px solid #bbb;
  padding: 2rem;
  margin: 0.5rem;
`
const TestimonyTitle = styled(Typography).attrs({
  color: 'primary',
})`
  padding-bottom: 2rem;
`

const TestimonyText = styled(Typography)``

const IntermediateImg = styled.img`
  display: block;
  width: 15rem;
  height: auto;
  padding-left: 4rem;
  padding-right: 4rem;
`

const FullWidthSection = styled.section`
  background-color: ${lightBlue};
  padding: 5rem;
  text-align: center;
  min-height: 25rem;

  ${windowWidthElement}
`

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 15rem;
  background-color: ${darkBlue};
  text-align: center;

  ${windowWidthElement}
`

export const Home = ({ location: { search } }) => (
  <StyledHome>
    {search === '?loginFailed' && (
      <LoginError>
        <Typography>
          La connexion a échoué, merci de bien vouloir réessayer ultérieurement.
        </Typography>
      </LoginError>
    )}
    <header>
      <LogosContainer>
        <AppTitle />
        <img
          src={logoPEMono}
          alt="logo pole emploi"
          style={{ height: '3.5rem', width: 'auto', display: 'block' }}
        />
      </LogosContainer>
      <HeaderMain>
        <div>
          <Tagline>
            L'actualisation
            <br />
            Pôle emploi
            <br />
            en toute
            <br />
            simplicité .
          </Tagline>
          <ConnectButton to="/api/login" target="_self">
            S'inscrire | Se connecter
          </ConnectButton>
        </div>
        <YoutubeVideo
          title="Vidéo de présentation du service Zen"
          url="https://www.youtube.com/embed/IjC1vgptPX0"
          image={youtubeVideoThumb}
        />
      </HeaderMain>
    </header>

    <Section
      style={{
        paddingBottom: '3rem',
        display: 'flex',
        flexDirection: 'column',
        jusityContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <SectionTitle>En quelques clics seulement !</SectionTitle>
      <StepsContainer>
        <Step>
          <StepImg src={step1} alt="Étape 1" />
          <StepTextContainer>
            <Typography gutterBottom>
              <GreenCheck />
              <b>Mise à jour de votre situation</b>
            </Typography>
            <IntermediateImg src={step1ToStep2} alt="" />
          </StepTextContainer>
        </Step>

        <Step>
          <StepTextContainer>
            <Typography>
              <GreenCheck />
              <b>Renseignez vos revenus par employeur</b>
            </Typography>
          </StepTextContainer>
          <StepImg src={step2} alt="Étape 2" />
        </Step>
      </StepsContainer>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IntermediateImg src={step2ToStep3} alt="" />
      </div>
      <Step>
        <StepImg src={step3} alt="Étape 3" />
        <StepTextContainer>
          <Typography>
            <GreenCheck />
            <b>Transmettez facilement les justificatifs demandés par Zen</b>
          </Typography>
        </StepTextContainer>
      </Step>
    </Section>

    <FlexSection>
      <SectionHalfContainer>
        <SectionTitle color="primary">
          Je suis informé(e) tous les mois du début de l'actualisation
        </SectionTitle>
        <Typography>
          Recevez chaque mois un rappel par mail pour ne pas oublier que vous
          devez vous actualiser. Soyez Zen !
        </Typography>
      </SectionHalfContainer>
      <SectionHalfContainerWithBg
        style={{ backgroundImage: `url(${landingBackground})` }}
      />
    </FlexSection>

    <FlexSectionReverse>
      <SectionHalfContainer>
        <SectionTitle color="primary">
          Je bénéficie d'une expérience plus facile pour m'actualiser.
        </SectionTitle>
        <Typography>
          Tous les justificatifs que vous devez fournir vous sont énumérés selon
          votre situation.
        </Typography>
      </SectionHalfContainer>
      <SectionHalfContainerWithBg
        style={{ backgroundImage: `url(${landingBackground})` }}
      />
    </FlexSectionReverse>

    <FlexSection>
      <SectionHalfContainer>
        <SectionTitle color="primary">
          <span style={{ fontWeight: 'normal' }}>
            Et si je n'ai pas mes justificatifs à temps pour l'actualisation ?
          </span>{' '}
          Pas de problème, Zen me permet de les transmettre à tout moment !
        </SectionTitle>
        <Typography>
          Vous pouvez vous connecter à tout moment et vous rendre dans la partie{' '}
          <b>Mes justificatifs</b> pour envoyer à Pôle Emploi ceux qui sont
          manquants.
        </Typography>
      </SectionHalfContainer>
      <SectionHalfContainerWithBg
        style={{ backgroundImage: `url(${landingBackground})` }}
      />
    </FlexSection>

    <Section style={{ textAlign: 'center', padding: '5rem' }}>
      <SectionTitle>Nos utilisateurs approuvent !</SectionTitle>
      <TestimoniesContainer>
        <TestimonyContainer>
          <TestimonyTitle>
            <b>Alex, assistante maternelle</b>
          </TestimonyTitle>
          <TestimonyText>
            « Je passe par Zen depuis octobre 2018 et pour le moment simple et
            très rapide, très satisfaite ! »
          </TestimonyText>
        </TestimonyContainer>
        <TestimonyContainer>
          <TestimonyTitle>
            <b>Isabelle, assistante maternelle</b>
          </TestimonyTitle>
          <TestimonyText>
            « Je passe par Zen depuis octobre 2018 et pour le moment simple et
            très rapide, très satisfaite ! » Yeah youpi danse de la victoire !
          </TestimonyText>
        </TestimonyContainer>
        <TestimonyContainer>
          <TestimonyTitle>
            <b>Perrine, assistante maternelle</b>
          </TestimonyTitle>
          <TestimonyText>
            « Je passe par Zen depuis octobre 2018 et pour le moment simple et
            très rapide, très satisfaite ! » Yeah yay youpi on est content de
            cette belle initiative fioulalalala !
          </TestimonyText>
        </TestimonyContainer>
      </TestimoniesContainer>
    </Section>

    <FullWidthSection style={{}}>
      <SectionTitle style={{ color: '#fff' }}>
        Pas d'engagement avec zen !
      </SectionTitle>
      <Typography paragraph style={{ color: '#fff' }}>
        Testez Zen et rejoignez notre communauté !
        <br />
        Sachez qu'à tout moment, vous pouvez arrêter votre essai de Zen.
      </Typography>

      <WhiteConnectButton to="/api/login" target="_self">
        S'inscrire | Se connecter
      </WhiteConnectButton>
    </FullWidthSection>

    <Footer>
      <AppTitle style={{ color: '#fff' }} />
      <br />
      <Typography
        variant="caption"
        style={{ color: '#fff', opacity: 0.5, letterSpacing: 1.5 }}
      >
        Un service propulsé par Pôle Emploi
      </Typography>
    </Footer>
  </StyledHome>
)

Home.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }),
}

export default Home
