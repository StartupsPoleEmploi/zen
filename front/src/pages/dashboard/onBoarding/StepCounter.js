import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { primaryBlue } from '../../../constants'

const Dot = styled.span`
  font-size: 8rem;
  color: ${({ selected, selectedColor, notSelectedColor }) =>
    selected ? selectedColor : notSelectedColor};
  font-family: auto;
  line-height: 0;
`

const Button = styled.button`
  overflow: hidden;
  border: none;
  cursor: pointer;
  background: none;
  padding: 0;
`

const Ol = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: inline-block;
`
const Li = styled.li`
  display: inline-block;
`

function StepCounter({
  itemNumber,
  currentStep,
  goToStep,
  selectedColor = primaryBlue,
  notSelectedColor = '#cde0f8',
}) {
  function updateStep(e) {
    goToStep(+e.currentTarget.getAttribute('data-step'))
  }

  const dots = []
  for (let i = 0; i < itemNumber; i++) {
    const isCurrent = i + 1 === currentStep

    dots.push(
      <Li aria-current={isCurrent ? 'step' : null} key={i}>
        <Button
          onClick={updateStep}
          type="button"
          title={`Aller à l'étape ${i + 1}`}
          data-step={i}
        >
          <Dot
            selected={isCurrent}
            selectedColor={selectedColor}
            notSelectedColor={notSelectedColor}
          >
            .
          </Dot>
        </Button>
      </Li>,
    )
  }

  return <Ol>{dots}</Ol>
}

StepCounter.propTypes = {
  itemNumber: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  goToStep: PropTypes.func.isRequired,
  selectedColor: PropTypes.string,
  notSelectedColor: PropTypes.string,
}

export default StepCounter
