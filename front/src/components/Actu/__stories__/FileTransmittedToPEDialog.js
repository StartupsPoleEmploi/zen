import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { host } from 'storybook-host';

import FileTransmittedToPEDialog from '../FileTransmittedToPEDialog';

const defaultProps = {
  isOpened: true,
  onConfirm: action('onConfirm'),
  onCancel: action('onCancel'),
};

storiesOf('FileTransmittedToPEDialog', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <FileTransmittedToPEDialog {...defaultProps} />);
