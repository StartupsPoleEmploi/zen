import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import PEConnectLink from '../PEConnectLink'

storiesOf('PEConnectLink', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('light', () => <PEConnectLink />)
  .add('dark', () => <PEConnectLink useDarkVersion />)
