import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { host } from 'storybook-host';

import DeclarationAlreadySentDialog from '../DeclarationAlreadySentDialog';

storiesOf('DeclarationAlreadySentDialog', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => (
    <DeclarationAlreadySentDialog isOpened onCancel={action('onCancel')} />
  ));
