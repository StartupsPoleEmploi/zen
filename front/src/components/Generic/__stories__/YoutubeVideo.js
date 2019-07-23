import { storiesOf } from '@storybook/react'
import React from 'react'
import { host } from 'storybook-host'

import YoutubeVideo from '../YoutubeVideo'

storiesOf('YoutubeVideo', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <YoutubeVideo id="video" />)
