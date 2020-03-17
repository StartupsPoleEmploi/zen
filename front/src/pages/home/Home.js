import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import ExpandMore from '@material-ui/icons/ExpandMore'
import EuroIcon from '@material-ui/icons/EuroSymbol'
import FaceIcon from '@material-ui/icons/FaceOutlined'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import SendIcon from '@material-ui/icons/SendOutlined'
import DescriptionIcon from '@material-ui/icons/DescriptionOutlined'

import YoutubeVideo from '../../components/Generic/YoutubeVideo'
import {
  intermediaryBreakpoint,
  mobileBreakpoint,
  primaryBlue,
} from '../../constants'

import characters from '../../images/characters.svg'
import photo1 from '../../images/photo1.jpg'
import photo2 from '../../images/photo2.jpg'
import photo3 from '../../images/photo3.jpg'

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
  component: 'h1',
  variant: 'h1',
  paragraph: true,
})`
  && {
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2rem;

    @media (max-width: ${mobileBreakpoint}) {
      font-size: 3rem;
      margin-bottom: 3rem;
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
      line-height: 2.7rem;
    }
  }
`

const Section = styled.section``

const TestimonySection = styled(Section)`
  padding: 5rem;
  text-align: center;
  @media (max-width: ${mobileBreakpoint}) {
    padding: 2rem 0;
  }
`

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
  variant: 'h1',
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

const SummaryImgContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${primaryBlue};
  border-radius: 50%;
  margin-bottom: 2rem;
  width: 7rem;
  height: 7rem;
`

const ArrowForward = styled(ArrowForwardIcon).attrs({ color: 'primary' })`
  && {
    height: 4rem;
    width: auto;
    display: block;
    padding: 0;
    margin-top: 3.5rem;
  }
`

const ArrowDownward = styled(ArrowDownwardIcon).attrs({ color: 'primary' })`
  && {
    padding: 0;
    height: 4rem;
    width: auto;
  }
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
  padding: 3rem 0;
  text-align: center;
  margin-bottom: 5rem;

  ${windowWidthElement}
`

const ZenIsForYouContainer = styled.div`
  display: flex;
  width: 50%;
  margin: auto;

  @media (max-width: ${intermediaryBreakpoint}) {
    width: 75%;
  }
  @media (max-width: ${mobileBreakpoint}) {
    width: 100%;
  }
`
const ZenIsForYouSubSection = styled.div`
  padding: 3rem;
  flex: 1;

  @media (max-width: ${intermediaryBreakpoint}) {
    padding: 1rem 3rem;
  }
`

const ZenIsForYouText = styled(Typography)`
  && {
    text-align: center;
    color: white;
    margin: auto;
  }
`

// These br are not active on mobile
const NotMobileBR = styled.br`
  @media (max-width: ${mobileBreakpoint}) {
    display: none;
  }
`

const summaryImgStyle = {
  display: 'block',
  height: 'auto',
  color: 'white',
  width: '4rem',
}

export const Home = ({ location: { search } }) => {
  const useMobileVersion = useMediaQuery(`(max-width:${mobileBreakpoint})`)
  const useIntermediaryVersion = useMediaQuery(
    `(max-width:${intermediaryBreakpoint})`,
  )

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
      <TopContentContainer>
        <TopContent>
          <TopContentTextsContainer>
            <Title
              paragraph
              style={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              L'actualisation <br />
              Pôle emploi <br />
              en toute <br />
              simplicité<span style={{ color: primaryBlue }}>.</span>
            </Title>
            <Tagline>
              Zen est un service Pôle emploi dédié aux{' '}
              <strong>personnes ayant un ou plusieurs employeurs.</strong>
              <br />
              Bénéficiez d'une actualisation et d'un envoi de justificatifs
              simplifiés.
            </Tagline>
            {useMobileVersion && (
              <Typography style={{ padding: '1rem 0 2rem' }}>
                <Link
                  href={`#${VIDEO_ID}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  En savoir plus sur Zen <ExpandMore />
                </Link>
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
        <SummaryUl>
          <SummaryLi>
            <SummaryImgContainer>
              <EuroIcon style={summaryImgStyle} alt="" />
            </SummaryImgContainer>
            <SummaryText>
              Zen additionne pour vous <NotMobileBR />
              vos heures travaillées et totalise <NotMobileBR />
              vos revenus mensuels !
            </SummaryText>
          </SummaryLi>
          <SummaryLi
            aria-hidden="true"
            style={{ padding: '0', display: 'block' }}
          >
            {useIntermediaryVersion ? (
              <ArrowDownward alt="" />
            ) : (
              <ArrowForward alt="" />
            )}
          </SummaryLi>
          <SummaryLi>
            <SummaryImgContainer>
              <SendIcon style={summaryImgStyle} alt="" />
            </SummaryImgContainer>
            <SummaryText>
              Zen vous indique <NotMobileBR />
              les justificatifs à transmettre selon <NotMobileBR />
              votre déclaration.
            </SummaryText>
          </SummaryLi>
          <SummaryLi
            aria-hidden="true"
            style={{ padding: '0', display: 'block' }}
          >
            {useIntermediaryVersion ? (
              <ArrowDownward alt="" />
            ) : (
              <ArrowForward alt="" />
            )}
          </SummaryLi>
          <SummaryLi>
            <SummaryImgContainer>
              <DescriptionIcon style={summaryImgStyle} alt="" />
            </SummaryImgContainer>
            <SummaryText>
              Accédez à un espace personnel
              <NotMobileBR /> avec tous vos justificatifs
              <NotMobileBR /> transmis mois par mois.
            </SummaryText>
          </SummaryLi>
        </SummaryUl>
      </Section>

      <FullWidthSection>
        <SectionTitle style={{ color: '#fff' }}>
          Zen est pour vous si ...
        </SectionTitle>
        <ZenIsForYouContainer>
          <ZenIsForYouSubSection>
            <ZenIsForYouText>
              <FaceIcon
                style={{
                  display: 'block',
                  margin: '0 auto 2rem auto',
                  width: '5rem',
                  height: 'auto',
                }}
              />
              <strong>
                Vous êtes{' '}
                <span aria-label="assistants ou assistantes maternels">
                  assistant.e maternel.le
                </span>
              </strong>
              <br />
              <span aria-label="inscrits ou inscrites">inscrit.e</span> à Pôle
              emploi
              <br />
              Exerçant une activité en France,
              <br />
              excepté en Bourgogne-Franche-Comté, Centre-Val de Loire
              <br />
              et dans les DOM-TOM
            </ZenIsForYouText>
          </ZenIsForYouSubSection>
        </ZenIsForYouContainer>
      </FullWidthSection>

      <Section>
        <SectionTitle style={{ textAlign: 'center' }}>
          Vous êtes <span aria-label="accompagné">accompagné(e)</span> à chaque
          étape
        </SectionTitle>
        <FlexDiv>
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
              déclaration. Je peux mettre à jour mon dossier sur l'interface Zen
              en transmettant mes pièces manquantes.
            </Typography>
          </StepText>
          <SectionImg alt="" src={photo2} />
        </FlexDivReverse>

        <FlexDiv>
          <StepText>
            <StepNumber>3</StepNumber>
            <StepTitle>
              J'ai fait mon actualisation sur Zen. Pas besoin de m'actualiser
              sur le site Pôle emploi !
            </StepTitle>
            <Typography>
              Vous pouvez imprimer ou télécharger votre déclaration sur le site
              de Zen ou bien la recevoir par mail après votre actualisation.
              C'est simple, c'est Zen !
            </Typography>
          </StepText>
          <SectionImg alt="" src={photo3} />
        </FlexDiv>
      </Section>

      <TestimonySection>
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
      </TestimonySection>
    </StyledHome>
  )
}

Home.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }),
}

export default Home
