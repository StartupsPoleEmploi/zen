import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import TooltipOnFocus from './TooltipOnFocus'
import { primaryBlue } from '../../constants'

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
    padding-right: 1.5rem;
    margin: 0;
  }
`

const FirstFormControlLabel = styled(StyledFormControlLabel)`
  && {
    border-radius: 0.5rem 0 0 0.5rem;
    margin-right: 0.3rem;
    border-right: solid 1px black;
  }
`
const SecondFormControlLabel = styled(StyledFormControlLabel)`
  && {
    border-radius: 0 0.5rem 0.5rem 0;
  }
`

const StyledRadio = styled(Radio)`
  && {
    color: #000000;
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
        style={{
          color: isYesChecked ? primaryBlue : 'rgba(0, 0, 0, 0.54)',
        }}
        inputProps={{
          'aria-describedby': `yes[${name}]`,
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
          <span
            style={{
              color: '##000000de',
              fontWeight: isYesChecked ? 'bold' : null,
            }}
          >
            oui
          </span>
        }
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
                color: isNoChecked ? primaryBlue : 'rgba(0, 0, 0, 0.54)',
              }}
            />
          }
          label={
            <span
              style={{
                color: '##000000de',
                fontWeight: isNoChecked ? 'bold' : null,
              }}
            >
              non
            </span>
          }
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
