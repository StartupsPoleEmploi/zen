import Button from '@material-ui/core/Button'
import React, { useState } from 'react'

import ActivityLog from './pages/ActivityLog'
import Declarations from './pages/Declarations'

const PAGES = {
  ACTIVITY: 'activity',
  DECLARATIONS: 'declarations',
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
      </div>
      {page === PAGES.DECLARATIONS && <Declarations />}
      {page === PAGES.ACTIVITY && <ActivityLog />}
    </React.Fragment>
  )
}

export default App
