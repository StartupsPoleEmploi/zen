import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import MaternalAssistantCheck from '../MaternalAssistantCheck'

storiesOf('MaternalAssistantCheck', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => (
    <MaternalAssistantCheck onValidate={action('onValidate')} />
  ))
