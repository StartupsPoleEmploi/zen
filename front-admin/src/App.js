import Button from '@material-ui/core/Button'
import React, { useState } from 'react'

import ActivityLog from './pages/ActivityLog'
import Declarations from './pages/Declarations'
import System from './pages/System'

const PAGES = {
  ACTIVITY: 'activity',
  DECLARATIONS: 'declarations',
  SYSTEM: 'system',
}

export const App = () => {
  const [page, setShowActivity] = useState(PAGES.DECLARATIONS)
  return (
    <React.Fragment>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-around',
          width: '40rem',
          margin: '1rem auto 0',
        }}
      >
        <Button
          variant="outlined"
          color={page === PAGES.DECLARATIONS ? 'primary' : 'default'}
          onClick={() => setShowActivity(PAGES.DECLARATIONS)}
        >
          Actualisations
        </Button>
        <Button
          variant="outlined"
          color={page === PAGES.ACTIVITY ? 'primary' : 'default'}
          onClick={() => setShowActivity(PAGES.ACTIVITY)}
        >
          Activité
        </Button>
        <Button
          variant="outlined"
          color={page === PAGES.SYSTEM ? 'primary' : 'default'}
          onClick={() => setShowActivity(PAGES.SYSTEM)}
        >
          Système
        </Button>
      </div>
      {page === PAGES.DECLARATIONS && <Declarations />}
      {page === PAGES.ACTIVITY && <ActivityLog />}
      {page === PAGES.SYSTEM && <System />}
    </React.Fragment>
  )
}

export default App
