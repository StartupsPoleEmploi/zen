import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { host } from 'storybook-host';

import DeclarationDialogsHandler from '../DeclarationDialogs/DeclarationDialogsHandler';

const defaultProps = {
  isOpened: true,
  isLoading: false,
  onConfirm: action('onConfirm'),
  onCancel: action('onCancel'),
  consistencyErrors: [],
  validationErrors: [],
};

storiesOf('DeclarationDialogsHandler', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('loading', () => (
    <DeclarationDialogsHandler {...defaultProps} isLoading />
  ))
  .add('consistency error', () => (
    <DeclarationDialogsHandler
      {...defaultProps}
      consistencyErrors={[
        'Arrêt du travail du 02/03 au 01/03',
        'Stage du 29/03 au 15/03',
      ]}
    />
  ))
  .add('validation error', () => (
    <DeclarationDialogsHandler
      {...defaultProps}
      validationErrors={['Votre statut ne vous permet pas de déclarer ceci']}
    />
  ));
