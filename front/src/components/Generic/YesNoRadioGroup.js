import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import TooltipOnFocus from './TooltipOnFocus'

const YES = 'yes'
const NO = 'no'

const StyledRadioGroup = styled(RadioGroup)`
  && {
    flex-wrap: nowrap;
  }
`

const StyledFormControlLabel = styled(FormControlLabel)`
  && {
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
      svg {
        font-size: 1.5rem;
      }
    }
  }
`

const getFormValue = (value) => (value === null ? '' : value ? YES : NO)

export class YesNoRadioGroup extends Component {
  onChange = (event) =>
    this.props.onAnswer({
      target: {
        value: event.target.value === YES,
        name: this.props.name,
      },
    })

  render() {
    const { name, value, yesTooltipContent } = this.props

    const isYesChecked = !!value
    const isNoChecked = value === false

    const yesRadio = (
      <StyledRadio
        inputProps={{
          'aria-describedby': `yes[${name}]`,
        }}
        style={{
          color: isYesChecked ? '#7ADF8F' : 'inherit',
        }}
      />
    )

    const yesFormLabelAndRadio = (
      <FirstFormControlLabel
        value={YES}
        control={
          yesTooltipContent ? (
            <TooltipOnFocus content={yesTooltipContent}>
              {yesRadio}
            </TooltipOnFocus>
          ) : (
            yesRadio
          )
        }
        label={
          <span style={{ color: isYesChecked ? '#fff' : 'inherit' }}>oui</span>
        }
        style={{ backgroundColor: isYesChecked ? '#4b4b4b' : '#f0f0f0' }}
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
          value={NO}
          control={
            <StyledRadio
              style={{
                color: isNoChecked ? '#F5A623' : 'inherit',
              }}
            />
          }
          label={
            <span style={{ color: isNoChecked ? '#fff' : 'inherit' }}>non</span>
          }
          style={{ backgroundColor: isNoChecked ? '#4b4b4b' : '#f0f0f0' }}
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
