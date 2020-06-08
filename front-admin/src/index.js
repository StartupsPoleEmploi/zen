import React from 'react';
import ReactDOM from 'react-dom';

import { UseradminProvider } from './common/contexts/useradminCtx';
import App from './App';


export default function Main() {
  return (
    <UseradminProvider>
      <App />
    </UseradminProvider>
  );
}


ReactDOM.render(<Main />, document.getElementById('root'));
