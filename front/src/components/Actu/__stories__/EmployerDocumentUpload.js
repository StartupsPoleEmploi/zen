import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import EmployerDocumentUpload from '../EmployerDocumentUpload'

const defaultProps = {
  id: 1,
  employerName: 'Jean Dupond',
  hasEndedThisMonth: false,
  submitFile: action('submitFile'),
}

storiesOf('EmployerDocumentUpload', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <EmployerDocumentUpload {...defaultProps} />)
  .add('ended this month', () => (
    <EmployerDocumentUpload {...defaultProps} hasEndedThisMonth />
  ))
  .add('loading', () => <EmployerDocumentUpload {...defaultProps} isLoading />)
  .add('with file', () => (
    <EmployerDocumentUpload {...defaultProps} fileExistsOnServer />
  ))
  .add('with file, ended this month', () => (
    <EmployerDocumentUpload
      {...defaultProps}
      fileExistsOnServer
      hasEndedThisMonth
    />
  ))
  .add('error', () => (
    <EmployerDocumentUpload {...defaultProps} error="Tout est cassé" />
  ))
