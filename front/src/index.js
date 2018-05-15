import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
  <Fragment>
    <CssBaseline />
    <App />
  </Fragment>,
  document.getElementsByTagName('body')[0],
)
registerServiceWorker()
