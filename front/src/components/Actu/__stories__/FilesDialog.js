import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import FilesDialog from '../FilesDialog'

storiesOf('FilesDialog', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <FilesDialog isOpened />)
