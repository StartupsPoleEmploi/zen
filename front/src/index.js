import CssBaseline from '@material-ui/core/CssBaseline'
import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
  <Fragment>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Fragment>,
  document.getElementById('root'),
)
registerServiceWorker()
