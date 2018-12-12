import PropTypes from 'prop-types'
import React, { Component } from 'react'
import NumberFormat from 'react-number-format'

export class EuroInput extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    inputRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  state = { isFocused: false }

  onFocus = () => this.setState({ isFocused: true })

  onBlur = () => this.setState({ isFocused: false })

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
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        getInputRef={inputRef}
        thousandSeparator=" "
        decimalSeparator=","
        suffix="€"
        allowNegative={false}
        decimalScale={2}
        // Used to avoid displaying ".00" on first input
        fixedDecimalScale={!this.state.isFocused}
      />
    )
  }
}

export default EuroInput
