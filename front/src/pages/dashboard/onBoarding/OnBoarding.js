import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt'
import superagent from 'superagent'
import ArrowBack from '@material-ui/icons/ArrowBack'

import step1 from '../../../images/onBoarding/step1.gif'
import step2 from '../../../images/onBoarding/step2.gif'
import step3 from '../../../images/onBoarding/step3.gif'
import step4 from '../../../images/onBoarding/step4.gif'
import step5 from '../../../images/onBoarding/step5.gif'

import { H1 } from '../../../components/Generic/Titles'
import MainActionButton from '../../../components/Generic/MainActionButton'
import StepCounter from './StepCounter'
import Slide from './Slide'

import { setNoNeedOnBoarding as setNoNeedOnBoardingAction } from '../../../redux/actions/user'
import { primaryBlue } from '../../../constants'
import { EmailForm } from './EmailForm'

const StyledOnBoarding = styled.div`
  max-width: 90rem;
  margin: 0 auto;
`

const Thanks = styled(Typography)`
  && {
    font-size: 4rem;
    display: block;
    font-weight: bold;
    text-align: center;
    margin: 0 auto 5rem auto;
  }
`

const Container = styled.div`
  box-shadow: 0 0 3.5rem 1rem #ddd;
  background: white;
`
const ActionBar = styled.div`
  padding: 2rem;
  height: 9rem;
  position: relative;
  text-align: center;
`

const StyledArrowRightAlt = styled(ArrowRightAlt)`
  margin-left: 1rem;
`

function OnBoarding({
  csrfToken,
  showThankYou = false,
  showEmail = false,
  setNoNeedOnBoarding,
}) {
  const [currentStep, setCurrentStep] = useState(1)

  const NUMBER_OF_STEP = 5

  function goToNextStep() {
    // Go to beginning
    if (currentStep === NUMBER_OF_STEP) {
      return superagent
        .post('/api/user/disable-need-on-boarding')
        .set('CSRF-Token', csrfToken)
        .then(() => setNoNeedOnBoarding())
    }
    setCurrentStep(currentStep + 1)
  }

  function goToStep(index) {
    setCurrentStep(index + 1)
  }
  function startAgain() {
    setCurrentStep(1)
  }

  return (
    <StyledOnBoarding>
      {showThankYou && (
        <Thanks>Merci pour votre demande d'utilisation de Zen</Thanks>
      )}

      {showEmail && <EmailForm csrfToken={csrfToken} />}

      <H1
        style={{
          textTransform: 'none',
          fontSize: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        Découvrez comment fonctionne Zen
      </H1>

      <Container>
        {currentStep === 1 && (
          <Slide
            leftText="Votre déclaration par employeur"
            badgeNumber="1"
            h2Content={
              <>
                Service d'actualisation pour les{' '}
                <span aria-label="assistants ou assistantes maternels">
                  assistant.es maternel.les
                </span>
              </>
            }
            img={step1}
            list={[
              <>
                Exerçant en France excepté dans les régions{' '}
                <strong>
                  Bourgogne-Franche-Comté, Centre-Val de Loire et les DOM-TOM.
                </strong>
              </>,
              <>
                Une actualisation adaptée à votre profession,{' '}
                <strong>employeur par employeur.</strong>
              </>,
            ]}
          />
        )}

        {currentStep === 2 && (
          <Slide
            leftText="Un e-mail indique le début de l'actualisation"
            badgeNumber="2"
            h2Content={
              <>N'attendez pas vos justificatifs pour vous actualiser</>
            }
            img={step2}
            list={[
              <>
                <strong>Un e-mail</strong> est envoyé à l'ouverture de la
                période d'actualisation
              </>,
              <>
                Vous pouvez vous actualiser{' '}
                <strong>même si vous n'avez pas vos justificatifs</strong> :
                fiches de paie, attestations employeur, arrêt maladie...
              </>,
            ]}
          />
        )}

        {currentStep === 3 && (
          <Slide
            leftText="Téléchargez et/ou imprimez votre déclaration d'actualisation depuis votre tableau de bord"
            badgeNumber="3"
            h2Content={<>Zen vous confirme que l'actualisation est validée</>}
            img={step3}
            list={[
              <>
                <strong>Un e-mail</strong> est envoyé quand l'actualisation est
                terminée
              </>,
              <>
                L'information est également présente depuis votre{' '}
                <strong>tableau de bord</strong>
              </>,
            ]}
          />
        )}

        {currentStep === 4 && (
          <Slide
            leftText="Gérez vos justificatifs depuis votre tableau de bord"
            badgeNumber="4"
            h2Content={<>Zen vous indique les justificatifs manquants</>}
            img={step4}
            list={[
              <>
                Pour éviter les risques de trop-perçu, Zen vous rapelle les
                justificatifs que vous devez fournir pour que{' '}
                <strong>votre situation Zen Pôle emploi soit à jour</strong>
              </>,
              <>
                <strong>
                  Vos justificatifs doivent correspondre exactement à votre
                  déclaration.
                </strong>{' '}
                Vous déclarez 10h pour 100€ brut, Pôle emploi attend une fiche
                de paie avec 10h et 100€ brut
              </>,
            ]}
          />
        )}

        {currentStep === 5 && (
          <Slide
            leftText="Zen transmet instantanément vos informations à Pôle emploi"
            badgeNumber="5"
            h2Content={<>L'actualisation Zen suffit</>}
            img={step5}
            list={[
              <>
                Si votre actualisation est faite sur Zen.
                <strong>
                  Vous ne devez pas refaire votre actualisation sur Pôle emploi
                </strong>
              </>,
              <>
                Vous n'êtes pas obligé de vous actualiser sur Zen. Vous pouvez
                continuer à faire votre actualisation sur{' '}
                <a href="https://pole-emploi.fr">pole-emploi.fr</a>
              </>,
            ]}
          />
        )}

        <ActionBar>
          {currentStep === NUMBER_OF_STEP && (
            <MainActionButton
              primary={false}
              onClick={startAgain}
              style={{
                position: 'absolute',
                left: '3rem',
                height: '5rem',
                width: 'auto',
                padding: '0 2rem',
                color: 'black',
              }}
            >
              <ArrowBack style={{ marginRight: '1rem', color: primaryBlue }} />
              Rejouer
            </MainActionButton>
          )}

          <StepCounter
            goToStep={goToStep}
            itemNumber={NUMBER_OF_STEP}
            currentStep={currentStep}
          />
          <MainActionButton
            style={{
              position: 'absolute',
              right: '3rem',
              height: '5rem',
              width: 'auto',
              padding: '0 2rem',
            }}
            primary
            onClick={goToNextStep}
          >
            {currentStep === NUMBER_OF_STEP ? "C'est parti" : 'Suivant'}
            <StyledArrowRightAlt />
          </MainActionButton>
        </ActionBar>
      </Container>
    </StyledOnBoarding>
  )
}

OnBoarding.propTypes = {
  csrfToken: PropTypes.string.isRequired,
  setNoNeedOnBoarding: PropTypes.func.isRequired,
  showThankYou: PropTypes.bool,
  showEmail: PropTypes.bool,
}

export default connect(
  (state) => ({
    csrfToken: state.userReducer.user.csrfToken,
  }),
  { setNoNeedOnBoarding: setNoNeedOnBoardingAction },
)(OnBoarding)
