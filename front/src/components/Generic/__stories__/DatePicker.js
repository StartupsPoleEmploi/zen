import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import moment from 'moment'
import React from 'react'
import { host } from 'storybook-host'

import DatePicker from '../DatePicker'

const activeMonthMoment = moment('2018-07-01T09:51:28.389Z')

const minDate = activeMonthMoment
  .clone()
  .startOf('month')
  .toDate()
const maxDate = activeMonthMoment
  .clone()
  .endOf('month')
  .toDate()

const defaultProps = {
  label: 'Entrez une date',
  name: 'date',
  onSelectDate: action('onSelectDate'),
  maxDate,
  minDate,
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
      value={activeMonthMoment
        .clone()
        .add(1, 'day')
        .toDate()}
    />
  ))
