import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import TooltipOnFocus from './TooltipOnFocus'

const StyledRadioGroup = styled(RadioGroup)`
  && {
    flex-wrap: nowrap;
  }
`

const StyledFormControlLabel = styled(FormControlLabel)`
  && {
    background-color: ${({ checked }) => (checked ? '#4b4b4b' : '#f0f0f0')};
    & > span {
      color: ${({ checked }) => (checked ? '#fff' : 'inherit')};
    }
    height: 3rem;
    padding-right: 1rem;
    margin: 0;
  }
`

const FirstFormControlLabel = styled(StyledFormControlLabel)`
  && {
    border-radius: 0.5rem 0 0 0.5rem;
    margin-right: 0.2rem;
  }
`
const SecondFormControlLabel = styled(StyledFormControlLabel)`
  && {
    border-radius: 0 0.5rem 0.5rem 0;
  }
`

const StyledRadio = styled(Radio)`
  && {
    && {
      color: ${({ value, checked }) =>
        checked ? (value === 'yes' ? '#7ADF8F' : '#F5A623') : 'inherit'};
      svg {
        font-size: 1.5rem;
      }
    }
  }
`

const getFormValue = (value) => (value === null ? value : value ? 'yes' : 'no')

export class YesNoRadioGroup extends Component {
  onChange = (event) =>
    this.props.onAnswer({
      target: {
        value: event.target.value === 'yes',
        name: this.props.name,
      },
    })

  render() {
    const { name, value, yesTooltipContent } = this.props

    const yesRadio = (
      <StyledRadio
        inputProps={{
          'aria-describedby': `yes[${name}]`,
        }}
      />
    )

    const yesFormLabelAndRadio = (
      <FirstFormControlLabel
        value="yes"
        control={
          yesTooltipContent ? (
            <TooltipOnFocus content={yesTooltipContent}>
              {yesRadio}
            </TooltipOnFocus>
          ) : (
            yesRadio
          )
        }
        label="oui"
        checked={value}
      />
    )

    return (
      <StyledRadioGroup
        row
        name={name}
        value={getFormValue(value)}
        onChange={this.onChange}
      >
        {yesFormLabelAndRadio}

        <SecondFormControlLabel
          value="no"
          control={<StyledRadio />}
          label="non"
          checked={value === false}
        />
      </StyledRadioGroup>
    )
  }
}
export default YesNoRadioGroup

YesNoRadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.bool,
  onAnswer: PropTypes.func.isRequired,
  yesTooltipContent: PropTypes.string,
}
