import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

const StyledFormControlLabel = styled(FormControlLabel)`
  background-color: ${({ checked }) => (checked ? '#4b4b4b' : '#f0f0f0')};
  & > span {
    color: ${({ checked }) => (checked ? '#fff' : 'inherit')};
  }
  height: 3rem;
  padding-right: 1rem;
`

const FirstFormControlLabel = StyledFormControlLabel.extend`
  border-radius: 0.5rem 0 0 0.5rem;
`
const SecondFormControlLabel = StyledFormControlLabel.extend`
  border-radius: 0 0.5rem 0.5rem 0;
  && {
    margin-right: 0;
  }
`

const StyledRadio = styled(Radio)`
  && {
    && {
      color: ${({ checked }) => (checked ? '#7dde8f' : 'inherit')};
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
    const { name, value } = this.props
    return (
      <RadioGroup
        row
        aria-label="oui ou non"
        name={name}
        value={getFormValue(value)}
        onChange={this.onChange}
      >
        <FirstFormControlLabel
          value="yes"
          control={<StyledRadio checked={value} />}
          label="oui"
          checked={value}
        />
        <SecondFormControlLabel
          value="no"
          control={<StyledRadio checked={value === false} />}
          label="non"
          checked={value === false}
        />
      </RadioGroup>
    )
  }
}
export default YesNoRadioGroup

YesNoRadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.bool,
  onAnswer: PropTypes.func.isRequired,
}
