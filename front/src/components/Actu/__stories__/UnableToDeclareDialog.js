import { storiesOf } from '@storybook/react';
import React from 'react';
import { host } from 'storybook-host';

import UnableToDeclareDialog from '../UnableToDeclareDialog';

storiesOf('UnableToDeclareDialog', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <UnableToDeclareDialog isOpened />);
