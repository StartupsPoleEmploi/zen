import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import UserJobCheck from '../UserJobCheck'

storiesOf('UserJobCheck', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <UserJobCheck onValidate={action('onValidate')} />)
