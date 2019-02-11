import PropTypes from 'prop-types'
import React, { Component } from 'react'
import NumberFormat from 'react-number-format'

export class HourInput extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    inputRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  onValueChange = (values) =>
    this.props.onChange({
      target: {
        name: this.props.name,
        value: values.floatValue,
      },
    })

  render() {
    const { inputRef, onChange, ...other } = this.props
    return (
      <NumberFormat
        {...other}
        onValueChange={this.onValueChange}
        getInputRef={inputRef}
        suffix="h"
        allowNegative={false}
        decimalScale={0}
      />
    )
  }
}

export default HourInput
