import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import EmployerQuestion from '../EmployerQuestion'

const defaultProps = {
  employerName: {
    value: null,
    error: null,
  },
  workHours: {
    value: null,
    error: null,
  },
  salary: {
    value: null,
    error: null,
  },
  hasEndedThisMonth: {
    value: null,
    error: null,
  },
  index: 1,
  onChange: action('onChange'),
  onRemove: action('onRemove'),
  activeMonth: new Date('2018-07-01T09:51:28.389Z'),
}

storiesOf('EmployerQuestion', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <EmployerQuestion {...defaultProps} />)
  .add('filled', () => (
    <EmployerQuestion
      {...defaultProps}
      employerName={{ value: 'Paul' }}
      workHours={{ value: '20' }}
      salary={{ value: '200' }}
      hasEndedThisMonth={{
        value: true,
      }}
    />
  ))
  .add('filled with errors', () => (
    <EmployerQuestion
      {...defaultProps}
      employerName={{ value: '', error: 'Champ obligatoire' }}
      workHours={{ value: 'Bim', error: 'Entrez un nombre entier' }}
      salary={{ value: 'Boum', error: 'Entrez un nombre entier' }}
      hasEndedThisMonth={{
        value: null,
        error: 'Champ obligatoire',
      }}
    />
  ))
