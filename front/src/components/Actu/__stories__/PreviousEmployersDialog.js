import { storiesOf } from '@storybook/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';

import PreviousEmployersDialog from '../PreviousEmployersDialog';

const onCancel = action('onConfirm');

storiesOf('PreviousEmployersDialog', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => (
    <PreviousEmployersDialog
      employers={[
        {
          id: 1,
          employerName: 'Bruce Wayne',
        },
        {
          id: 2,
          employerName: 'Tony Stark',
        },
      ]}
      isOpened
      onCancel={onCancel}
    />
  ));
