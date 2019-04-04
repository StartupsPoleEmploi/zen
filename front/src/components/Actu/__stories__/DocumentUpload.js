import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import DocumentUpload from '../DocumentUpload'

const defaultProps = {
  documentId: 1,
  label: 'Feuille maladie',
  submitFile: action('Submit file'),
  skipFile: () => {},
  type: DocumentUpload.types.infos,
}

storiesOf('DocumentUpload', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default for declaration info document', () => (
    <DocumentUpload {...defaultProps} />
  ))
  .add('default for employer document', () => (
    <DocumentUpload
      {...defaultProps}
      label="Attestation employeur"
      type={DocumentUpload.types.employer}
      employerId={2}
      employerDocType="salarySheet"
    />
  ))
  .add('loading', () => <DocumentUpload {...defaultProps} isLoading />)
  .add('with file', () => (
    <DocumentUpload {...defaultProps} fileExistsOnServer name="MyFileName" />
  ))
  .add('error', () => (
    <DocumentUpload {...defaultProps} error="Tout est cassé" />
  ))
