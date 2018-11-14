import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import LoginAgainDialog from '../LoginAgainDialog'

storiesOf('LoginAgainDialog', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <LoginAgainDialog isOpened />)
