import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import HourInput from '../HourInput'

const defaultProps = {
  onChange: action('onChange'),
  name: 'hour',
  inputRef: () => {},
}

storiesOf('HourInput', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <HourInput {...defaultProps} />)
  .add('with integer value', () => <HourInput {...defaultProps} value={102} />)
