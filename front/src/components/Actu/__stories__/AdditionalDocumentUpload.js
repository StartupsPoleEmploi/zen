import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import AdditionalDocumentUpload from '../AdditionalDocumentUpload'

const defaultProps = {
  declarationId: 1,
  label: 'Feuille maladie',
  submitFile: action('Submit file'),
}

storiesOf('AdditionalDocumentUpload', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <AdditionalDocumentUpload {...defaultProps} />)
  .add('loading', () => (
    <AdditionalDocumentUpload {...defaultProps} isLoading />
  ))
  .add('with file', () => (
    <AdditionalDocumentUpload
      {...defaultProps}
      fileExistsOnServer
      name="MyFileName"
    />
  ))
  .add('error', () => (
    <AdditionalDocumentUpload {...defaultProps} error="Tout est cassé" />
  ))
