import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'

import DocumentUpload from '../DocumentUpload'

const defaultProps = {
  id: 1,
  documentId: 1,
  label: 'Feuille maladie',
  submitFile: action('Submit file'),
  skipFile: () => {},
  removePageFromFile: action('Remove page from file'),
  type: DocumentUpload.types.info,
  showPreview: action('Show file'),
  useLightVersion: false,
}

storiesOf('DocumentUpload', module)
  .add('default for declaration info document', () => (
    <DocumentUpload {...defaultProps} />
  ))
  .add('default for declaration info document (light version)', () => (
    <DocumentUpload {...defaultProps} useLightVersion />
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
  .add('default for employer document (light version', () => (
    <DocumentUpload
      {...defaultProps}
      label="Attestation employeur"
      type={DocumentUpload.types.employer}
      employerId={2}
      employerDocType="salarySheet"
      useLightVersion
    />
  ))
  .add('loading', () => <DocumentUpload {...defaultProps} isLoading />)
  .add('loading (light version)', () => (
    <DocumentUpload {...defaultProps} isLoading />
  ))
  .add('with file', () => (
    <DocumentUpload {...defaultProps} fileExistsOnServer />
  ))
  .add('with file (light version)', () => (
    <DocumentUpload {...defaultProps} fileExistsOnServer useLightVersion />
  ))
  .add('with transmitted file', () => (
    <DocumentUpload {...defaultProps} fileExistsOnServer isTransmitted />
  ))
  .add('with transmitted file (light version)', () => (
    <DocumentUpload
      {...defaultProps}
      fileExistsOnServer
      isTransmitted
      useLightVersion
    />
  ))
  .add('error', () => (
    <DocumentUpload {...defaultProps} error="Tout est cassé" />
  ))

  .add('error (light version)', () => (
    <DocumentUpload {...defaultProps} error="Tout est cassé" useLightVersion />
  ))
