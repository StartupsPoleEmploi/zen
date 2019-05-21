import { storiesOf } from '@storybook/react'
import React from 'react'

import Home from '../Home'

storiesOf('Home', module)
  .add('default', () => <Home location={{}} />)
  .add('loginFailed', () => <Home location={{ search: '?loginFailed' }} />)
