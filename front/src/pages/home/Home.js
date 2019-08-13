import Button from '@material-ui/core/Button'
import MuiLink from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'
import ExpandMore from '@material-ui/icons/ExpandMore'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import AppTitle from '../../components/Generic/AppTitle'
import YoutubeVideo from '../../components/Generic/YoutubeVideo'
import {
  intermediaryBreakpoint,
  mobileBreakpoint,
  primaryBlue,
  secondaryBlue,
} from '../../constants'
import characters from '../../images/characters.svg'
import logoPEMono from '../../images/logoPE-mono.png'
import photo1 from '../../images/photo1.jpg'
import photo2 from '../../images/photo2.jpg'
import photo3 from '../../images/photo3.jpg'
import step1 from '../../images/step1.svg'
import step2 from '../../images/step2.svg'
import step3 from '../../images/step3.svg'

const VIDEO_ID = 'home-video'

const windowWidthElement = `
  width: 100vw;
  left: 50%;
  margin-left: -50vw;
  position: relative;
`

const StyledHome = styled.div`
  max-width: 144rem;
  margin: auto;
  padding: 0 10rem;

  @media (max-width: ${mobileBreakpoint}) {
    padding: 0 2rem;
  }
`

const LoginError = styled.div`
  padding: 1rem;
  background-color: #f57264;
  text-align: center;

  ${windowWidthElement}
`

const Header = styled.header.attrs({ role: 'banner' })`
  background-color: #f3f4f5;
  padding: 5rem 10rem 4rem;

  ${windowWidthElement}
`

const HeaderContent = styled.header`
  max-width: 144rem;
  display: flex;
  align-items: flex-end;
  margin: auto;

  @media (max-width: ${intermediaryBreakpoint}) {
    justify-content: center;
    align-items: center;
  }
`

const TopContentContainer = styled.section`
  background-color: #f3f4f5;
  padding: 0 10rem 15rem;
  border-bottom-left-radius: 95% 15%;
  border-bottom-right-radius: 95% 15%;

  @media (max-width: ${intermediaryBreakpoint}) {
    padding: 0 2rem 15rem;
  }

  ${windowWidthElement}
`

const TopContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 2rem;
  margin: 0 0 2rem;
  max-width: 144rem;
  margin: 0 auto;

  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
`

const TopContentTextsContainer = styled.div`
  max-width: 100%;
  padding-right: 2rem;
  padding-bottom: 3rem;

  @media (max-width: ${mobileBreakpoint}) {
    padding-right: 0;
    padding-bottom: 0;
  }
`

const Title = styled(Typography).attrs({
  variant: 'h3',
  component: 'h1',
  paragraph: true,
})`
  && {
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2rem;

    @media (max-width: ${mobileBreakpoint}) {
      font-size: 3.4rem;
    }
  }
`

const Tagline = styled(Typography).attrs({
  variant: 'h6',
  component: 'h2',
  paragraph: true,
})`
  && {
    max-width: 36rem;
    @media (max-width: ${mobileBreakpoint}) {
      margin: auto;
    }
  }
`

const ConnectButton = styled(Button).attrs({
  color: 'primary',
  variant: 'contained',
  href: '/api/login',
  role: 'link', // override material-ui default role for buttons, even if links
})`
  && {
    width: 40rem;
    max-width: 100%;
    min-height: 6.4rem;
    font-size: 2.2rem;
    border-radius: 3rem;
    margin: 1rem 0;

    @media (max-width: ${mobileBreakpoint}) {
      font-size: 1.6rem;
    }
  }
`

const WhiteConnectButton = styled(ConnectButton)`
  && {
    background-color: #fff;
    color: #000;

    &:hover {
      background-color: #fff;
    }
  }
`

const Section = styled.section``

const SectionTitle = styled(Typography).attrs({
  variant: 'h5',
  component: 'h2',
})`
  && {
    font-weight: bold;
    padding-bottom: 2rem;
  }
`

const FlexDiv = styled.div`
  display: flex;

  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: column;
  }
`

const FlexDivReverse = styled(FlexDiv)`
  flex-direction: row-reverse;
`

const AccessibleHiddenTitle = styled.h2`
  position: absolute;
  left: -999rem;
`

const StepText = styled.div`
  flex: 0 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: ${intermediaryBreakpoint}) {
    text-align: center;
  }
`

const StepTitle = styled(SectionTitle).attrs({
  color: 'secondary',
  component: 'h3',
})``

const StepNumber = styled(Typography).attrs({
  variant: 'h2',
  component: 'div',
  color: 'primary',
})`
  && {
    align-self: flex-start;
    font-weight: bold;

    @media (max-width: ${intermediaryBreakpoint}) {
      align-self: center;
      text-align: center;
    }
  }
`

const SectionImg = styled.img`
  width: 30rem;
  height: 30rem;
  margin: 2rem auto;
`

const SummaryUl = styled.ul`
  display: flex;
  list-style: none;
  justify-content: space-around;
  width: 100%;
  padding: 0;

  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: column;
    align-items: center;
  }
`

const SummaryLi = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
`

const SummaryImg = styled.img`
  display: block;
  background: #f3f4f5;
  border-radius: 50%;
  flex: 0;
  height: auto;
  width: 10rem;
  margin-bottom: 1rem;
`

const SummaryText = styled(Typography)`
  && {
    font-weight: bold;
  }
`

const TestimoniesContainer = styled.div`
  display: flex;
  justify-content: space-around;

  @media (max-width: ${intermediaryBreakpoint}) {
    flex-direction: column;
    align-items: center;
  }
`
const TestimonyContainer = styled.div`
  flex: 0 0 auto;
  border: 1px solid #bbb;
  padding: 2rem;
  margin: 1rem;
  max-width: 25rem;
`
const TestimonyTitle = styled(Typography).attrs({
  color: 'secondary',
})`
  padding-bottom: 2rem;
`

const TestimonyText = styled(Typography)``

const FullWidthSection = styled.section`
  background-color: ${primaryBlue};
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
  background-color: ${secondaryBlue};
  text-align: center;

  ${windowWidthElement}
`

export const Home = ({ location: { search } }) => {
  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`)

  return (
    <StyledHome>
      {search === '?loginFailed' && (
        <LoginError>
          <Typography>
            <strong>
              La connexion a échoué, merci de bien vouloir réessayer
              ultérieurement.
            </strong>
          </Typography>
        </LoginError>
      )}

      <Header>
        <HeaderContent>
          <AppTitle />
          <img
            src={logoPEMono}
            alt="logo pole emploi"
            style={{
              height: '3.5rem',
              width: 'auto',
              display: 'block',
            }}
          />
        </HeaderContent>
      </Header>

      <main role="main">
        <TopContentContainer>
          <TopContent>
            <TopContentTextsContainer>
              <Title
                variant="h4"
                component="h1"
                paragraph
                style={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                L'actualisation
                <br />
                Pôle emploi
                <br />
                en toute
                <br />
                simplicité.
              </Title>
              <Tagline>
                Zen vous propose une actualisation et un envoi de justificatifs
                simplifiés.
              </Tagline>
              <ConnectButton>Se connecter avec Pôle Emploi</ConnectButton>
              {useMobileVersion && (
                <Typography style={{ padding: '1rem 0 2rem' }}>
                  <MuiLink
                    href={`#${VIDEO_ID}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    En savoir plus sur Zen <ExpandMore />
                  </MuiLink>
                </Typography>
              )}
            </TopContentTextsContainer>
            <YoutubeVideo id={VIDEO_ID} />
          </TopContent>
        </TopContentContainer>

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
          <img
            src={characters}
            alt=""
            style={{
              marginTop: '-15rem',
              marginBottom: '3rem',
              position: 'relative',
              maxWidth: '100%',
              minHeight: '15rem',
            }}
          />
          <SectionTitle>En quelques clics&nbsp;!</SectionTitle>
          <SummaryUl>
            <SummaryLi>
              <SummaryImg src={step1} alt="" />
              <SummaryText>
                Zen additionne pour vous
                <br />
                vos heures travaillées et totalise
                <br />
                vos revenus mensuels !
              </SummaryText>
            </SummaryLi>
            <SummaryLi>
              <SummaryImg src={step2} alt="" />
              <SummaryText>
                Zen vous indique
                <br />
                les justificatifs à transmettre selon
                <br /> votre déclaration.
              </SummaryText>
            </SummaryLi>
            <SummaryLi>
              <SummaryImg src={step3} alt="" />
              <SummaryText>
                Accédez à un espace personnel
                <br /> avec tous vos justificatifs
                <br /> transmis mois par mois.
              </SummaryText>
            </SummaryLi>
          </SummaryUl>
        </Section>

        <Section>
          <FlexDiv>
            <AccessibleHiddenTitle>En résumé</AccessibleHiddenTitle>
            <StepText>
              <StepNumber>1</StepNumber>
              <StepTitle>
                Je suis informé(e) tous les mois du début de l'actualisation
              </StepTitle>
              <Typography>
                Recevez chaque mois un rappel par mail pour ne pas oublier que
                vous devez vous actualiser. Soyez Zen&nbsp;!
              </Typography>
            </StepText>
            <SectionImg alt="" src={photo1} />
          </FlexDiv>

          <FlexDivReverse>
            <StepText>
              <StepNumber>2</StepNumber>
              <StepTitle>
                Mon dossier est à jour, je perçois le bon montant d'indemnité :
                moins de risque de trop perçus !
              </StepTitle>
              <Typography>
                Zen m'indique les justificatifs à transmettre selon ma
                déclaration. Je peux mettre à jour mon dossier sur l'interface
                Zen en transmettant mes pièces manquantes.
              </Typography>
            </StepText>
            <SectionImg alt="" src={photo2} />
          </FlexDivReverse>

          <FlexDiv>
            <StepText>
              <StepNumber>3</StepNumber>
              <StepTitle>
                J'ai fait mon actualisation sur Zen. Pas besoin de m'actualiser
                sur le site Pôle Emploi !
              </StepTitle>
              <Typography>
                Vous pouvez imprimer ou télécharger votre déclaration sur le
                site de Zen ou bien la recevoir par mail après votre
                actualisation. C'est simple, c'est Zen !
              </Typography>
            </StepText>
            <SectionImg alt="" src={photo3} />
          </FlexDiv>
        </Section>

        <FullWidthSection style={{}}>
          <SectionTitle style={{ color: '#fff' }}>
            Rejoignez les utilisateurs de Zen&nbsp;!
          </SectionTitle>
          <Typography paragraph style={{ color: '#fff' }}>
            Zen est un service innovant de Pôle Emploi pour faciliter
            <br />
            l'actualisation. Il est dédié aux personnes ayant plusieurs
            employeurs.
            <br />
            <b>
              Ce service est actuellement disponible pour
              <br />
              les assistantes maternelles en Hauts-de-France et en Occitanie.
            </b>
          </Typography>

          <WhiteConnectButton>Se connecter avec Pôle Emploi</WhiteConnectButton>
        </FullWidthSection>

        <Section style={{ textAlign: 'center', padding: '5rem' }}>
          <SectionTitle>Nos utilisateurs approuvent !</SectionTitle>
          <TestimoniesContainer>
            <TestimonyContainer>
              <TestimonyTitle>
                <b>
                  Déborah - Lille
                  <br />
                  (11/04/19)
                </b>
              </TestimonyTitle>
              <TestimonyText>
                « Merci pour ce site qui prend en compte pleinement notre métier
                d'assistante maternelle&nbsp;»
              </TestimonyText>
            </TestimonyContainer>
            <TestimonyContainer>
              <TestimonyTitle>
                <b>
                  Sophie - Condette
                  <br />
                  (10/04/19)
                </b>
              </TestimonyTitle>
              <TestimonyText>
                « Plus simple vu le nombre d'employeurs. Belle innovation&nbsp;»
              </TestimonyText>
            </TestimonyContainer>
            <TestimonyContainer>
              <TestimonyTitle>
                <b>
                  Fatima - Amiens
                  <br />
                  (09/04/19)
                </b>
              </TestimonyTitle>
              <TestimonyText>
                « C'est plus rapide, moins prise de tête, et facile à
                comprendre&nbsp;!&nbsp;»
              </TestimonyText>
            </TestimonyContainer>
          </TestimoniesContainer>
        </Section>
      </main>

      <Footer role="contentinfo">
        <AppTitle style={{ color: '#fff' }} />
        <br />
        <Typography
          variant="caption"
          // 0.51 (not 0.5) is the accessibility threshold for our background color
          style={{ color: '#fff', opacity: 0.51, letterSpacing: 1.5 }}
        >
          Un service propulsé par Pôle Emploi
        </Typography>
      </Footer>
    </StyledHome>
  )
}

Home.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }),
}

export default Home
