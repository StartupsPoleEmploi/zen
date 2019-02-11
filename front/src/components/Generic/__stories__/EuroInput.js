import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import EuroInput from '../EuroInput'

const defaultProps = {
  onChange: action('onChange'),
  name: 'euro',
  inputRef: () => {},
}

storiesOf('EuroInput', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <EuroInput {...defaultProps} />)
  .add('with integer value', () => <EuroInput {...defaultProps} value={1} />)
  .add('with float value', () => <EuroInput {...defaultProps} value={1.2} />)
  .add('with big integer value', () => (
    <EuroInput {...defaultProps} value={10000} />
  ))
  .add('with big float value', () => (
    <EuroInput {...defaultProps} value={10200.4} />
  ))
