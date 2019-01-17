import React, { useState, useEffect } from 'react'
import superagent from 'superagent'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

export const System = () => {
  const [isActivated, setIsActivated] = useState(null)
  const [isModified, setIsModified] = useState(false)

  useEffect(() => {
    superagent.get('/api/status').then(({ body }) => setIsActivated(body.up))
  }, [])

  useEffect(
    () => {
      if (!isModified) return

      superagent
        .post('/zen-admin-api/status', { up: isActivated })
        .then(({ body }) => setIsActivated(body.up))
    },
    [isActivated],
  )

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Système</h1>
      <b>
        Cette page permet d'afficher la modale de désactivation d'urgence de
        Zen, bloquant le service. Ne pas manipuler sans raison !
      </b>
      {isActivated !== null && (
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={isActivated}
                onChange={() => {
                  setIsModified(true)
                  setIsActivated(!isActivated)
                }}
              />
            }
            label={isActivated ? 'Zen est Activé' : <b>Zen est désactivé</b>}
          />
        </div>
      )}
    </div>
  )
}

export default System
