import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { UseradminProvider } from './common/contexts/useradminCtx';
import App from './App';

const browserHistory = createBrowserHistory({
  basename: '/zen-admin',
});


export default function Main() {
  return (
    <Router history={browserHistory}>
      <UseradminProvider>
        <App />
      </UseradminProvider>
    </Router>
  );
}


ReactDOM.render(<Main />, document.getElementById('root'));
