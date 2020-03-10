import React, { useState, useEffect, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import CloseIcon from '@material-ui/icons/Close'
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

import { helpColor } from '../../constants'

import { H2 } from './Titles'
import MainActionButton from './MainActionButton'
import StepCounter from '../../pages/dashboard/onBoarding/StepCounter'

const OVERLAY_PADDING = 12

const InfoImg = styled(InfoOutlinedIcon)`
  && {
    color: ${helpColor};
    margin-right: 1rem;
    vertical-align: sub;
  }
`

const Background = styled.div`
  position: fixed;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  background: #dcdcdc;
  opacity: 0.8;
  z-index: 999999;
`

const Slide = styled.div`
  position: fixed;
  bottom: 0;
  left: 25rem;
  padding: 2rem 2rem 3rem 2rem;
  background: white;
  z-index: 1000001;
  max-width: 35rem;
  box-shadow: 0 0 0.5rem 0.1rem #a7a7a7;

  @media (max-width: 672px) {
    left: 1rem;
    bottom: 2rem;
  }
`

const Title = styled.div`
  position: relative;
  margin-bottom: 1rem;
`
const StyledCloseIcon = styled(CloseIcon)`
  && {
    position: absolute;
    right: 0;
    color: gray;
    cursor: pointer;
  }
`

const Button = styled.div`
  float: right;
`
const StyledArrowRightAlt = styled(ArrowRightAlt)`
  margin-left: 1rem;
`

const ActionsContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: space-between;
  position: relative;
`
const WhiteOverlay = styled.div`
  background: white;
  position: absolute;
  z-index: 999999;
  transition: all 0.25s;
`
const TransparentOverlay = styled.div`
  background: transparent;
  position: absolute;
  z-index: 1000004;
  transition: all 0.25s;
  box-shadow: 0 0 0.5rem 0.1rem gray;
`

function TooltipsDemo({ onFinish, slides }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Bloc coordinates
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  // In order to make the component more independant and maintenable, we use raw JavaScript
  useEffect(() => {
    if (currentSlide > slides.length - 1) {
      const current = document.querySelector('.intro-overlay')
      if (current) {
        current.classList.remove('intro-overlay')
        current.classList.remove('intro-overlay-bg')
      }
      return
    }

    const slide = slides[currentSlide]
    const { selector } = slide

    const current = document.querySelector('.intro-overlay')
    const node = document.querySelector(selector)

    if (node) {
      node.classList.add('intro-overlay')
      if (current) current.classList.remove('intro-overlay-bg')

      setTop(node.offsetTop - OVERLAY_PADDING / 2)
      setLeft(node.offsetLeft - OVERLAY_PADDING / 2)
      setWidth(node.offsetWidth + OVERLAY_PADDING)
      setHeight(node.offsetHeight + OVERLAY_PADDING)
    }

    setTimeout(() => {
      if (node) node.classList.add('intro-overlay-bg')
      if (current) current.classList.remove('intro-overlay')
    }, 200)

    // Note: raw JavaScript here
  }, [currentSlide, slides])

  // Handle when window resize
  useLayoutEffect(() => {
    function updateOverlayCoordinates() {
      let current = document.querySelector('.intro-overlay')
      if (!current) {
        /*
          When basculing from mobile view to desktop (or contrary),
          we lose the 'intro-overlay' and 'intro-overlay-bg' classes
          due to the complete app redraw by React.
          So we re-use the selector to get it
        */
        const { selector } = slides[currentSlide]
        current = document.querySelector(selector)
        if (!current) return

        current.classList.add('intro-overlay')
        current.classList.add('intro-overlay-bg')
      }

      setTop(current.offsetTop - OVERLAY_PADDING / 2)
      setLeft(current.offsetLeft - OVERLAY_PADDING / 2)
      setWidth(current.offsetWidth + OVERLAY_PADDING)
      setHeight(current.offsetHeight + OVERLAY_PADDING)
    }
    window.addEventListener('resize', updateOverlayCoordinates)
    return () => window.removeEventListener('resize', updateOverlayCoordinates)
  }, [])

  function goToStep(index) {
    setCurrentSlide(index)
  }

  function goToNextSlide() {
    const nextSlide = currentSlide + 1
    if (nextSlide >= slides.length) {
      const current = document.querySelector('.intro-overlay')
      if (current) current.classList.remove('intro-overlay')
      return onFinish()
    }
    setCurrentSlide(nextSlide)
  }

  const lastSlide = currentSlide === slides.length - 1

  return (
    <>
      <Background />

      <WhiteOverlay style={{ left, top, width, height }} />
      <TransparentOverlay style={{ left, top, width, height }} />

      <Slide>
        <Title>
          <H2 style={{ fontSize: '2rem', display: 'inline-block' }}>
            <InfoImg alt="Informations" />
            Zen vous guide
          </H2>
          <Button title="Fermer l'aide" onClick={onFinish}>
            <StyledCloseIcon />
          </Button>
        </Title>

        {slides[currentSlide].content}

        <ActionsContainer>
          <StepCounter
            itemNumber={slides.length}
            currentStep={currentSlide + 1}
            goToStep={goToStep}
            selectedColor={helpColor}
            notSelectedColor="#e3cfe8"
          />
          <MainActionButton
            type="button"
            primary
            style={{
              fontSize: '1.7rem',
              borderRadius: '999rem',
              background: helpColor,
              width: '16rem',
              height: '5rem',
              position: 'absolute',
              right: '1rem',
            }}
            title={
              lastSlide
                ? 'Commencer à déclarer vos employeurs'
                : 'Aide suivante'
            }
            onClick={goToNextSlide}
          >
            {lastSlide ? "J'ai compris" : 'Suivant'}
            <StyledArrowRightAlt />
          </MainActionButton>
        </ActionsContainer>
      </Slide>
    </>
  )
}

TooltipsDemo.propTypes = {
  onFinish: PropTypes.func.isRequired,
  slides: PropTypes.array.isRequired,
}

export default TooltipsDemo
