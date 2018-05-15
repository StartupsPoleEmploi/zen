import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'

import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
  <Fragment>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Fragment>,
  document.getElementsByTagName('body')[0],
)
registerServiceWorker()
