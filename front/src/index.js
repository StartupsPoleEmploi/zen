import '@babel/polyfill'
import 'moment/locale/fr'

import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import moment from 'moment'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import './lib/external/gtm'
import './lib/external/hotjar'

import { version } from '../package.json'
import App from './App'
import store from './store'
import DeveloperDialog from './components/Generic/DeveloperDialog'

const environment = process.env.REACT_APP_SENTRY_ENV || process.env.NODE_ENV

if (environment !== 'development') {
  window.Raven.config(
    'https://a1844e1ab4404bf9b6b63fe127874cdf@sentry.io/1216087',
    {
      release: version,
      environment,
    },
  ).install()
}

moment.locale('fr')

const theme = createMuiTheme({
  typography: {
    useNextVariants: true, // Preparation for Material-UI v4 new variants. Can be removed after migration.
    // Tell Material-UI what's the font-size on the html element is.
    htmlFontSize: 10,
    fontFamily: [
      'filson-soft',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  palette: {
    primary: {
      main: '#0065DB',
    },
    secondary: {
      main: '#262C65',
    },
    background: {
      default: '#fff',
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'unset',
      },
    },
    MuiTooltip: {
      popper: {
        // default value is pointer-events none, which breaks logout in tooltip
        pointerEvents: 'auto',
      },
    },
  },
})

ReactDOM.render(
  <Provider store={store}>
    <CssBaseline />
    <MuiThemeProvider theme={theme}>
      {/* The following modal must never be displayed out of dev mode, modify with extreme caution */
      process.env.NODE_ENV === 'development' && <DeveloperDialog />}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root'),
)
