import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import DatePicker from '../DatePicker'

const defaultProps = {
  label: 'Entrez une date',
  name: 'date',
  onSelectDate: action('onSelectDate'),
}

storiesOf('DatePicker', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <DatePicker {...defaultProps} />)
  .add('with selected date', () => (
    <DatePicker
      {...defaultProps}
      value={new Date('2018-06-18T09:26:06.026Z')}
    />
  ))
