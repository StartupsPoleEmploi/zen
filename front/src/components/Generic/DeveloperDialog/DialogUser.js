import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import TextField from '@material-ui/core/TextField'
import { omit } from 'lodash'
import React, { Fragment, useEffect, useState } from 'react'
import superagent from 'superagent'

import catchMaintenance from '../../../lib/catchMaintenance'

const DEFAULT_STR = `{
  "id": 510,
  "firstName": "Harry",
  "lastName": "Pisces",
  "email": "harry@pisces.com",
  "gender": "female",
  "isAuthorized": true,
  "isBlocked": false,
  "needOnBoarding": false,
  "needEmployerOnBoarding": false,
  "registeredAt": "2019-05-06",
  "canSendDeclaration": true,
  "hasAlreadySentDeclaration": false,
  "tokenExpirationDate": "2059-05-06T13:34:15.985Z"
}`

export default function DialogUser() {
  const [csrfToken, setCsrfToken] = useState(null)
  const [sessionUser, setSessionUser] = useState('')
  const [error, setError] = useState(null)

  const submit = () => {
    try {
      superagent
        .post('/api/developer/session/user', JSON.parse(sessionUser))
        .set('CSRF-Token', csrfToken)
        .then(() => window.location.reload(true))
        .catch(catchMaintenance)
        .catch((err) => setError(`Erreur serveur : ${err}`))
    } catch (err) {
      return setError(`Le JSON est invalide : ${err}`)
    }
  }

  useEffect(() => {
    superagent.get('/api/developer/session/user').then(({ body }) => {
      setCsrfToken(body.csrfToken)
      setSessionUser(JSON.stringify(omit(body, 'csrfToken'), null, 2))
    })
    .catch(catchMaintenance)
  }, [])

  return (
    <Fragment>
      <DialogContentText paragraph>
        Permet de changer <code>req.session.user</code> côté back (JSON).
        <br />
        Exemple à réutiliser :
      </DialogContentText>
      <pre style={{ textAlign: 'left', fontSize: '1.4rem' }}>
        <code>{DEFAULT_STR}</code>
      </pre>
      {error && (
        <DialogContentText paragraph style={{ color: 'red' }}>
          {error}
        </DialogContentText>
      )}
      <TextField
        label="JSON"
        value={sessionUser}
        onChange={(e) => setSessionUser(e.target.value)}
        variant="outlined"
        multiline
        fullWidth
        inputProps={{ style: { fontFamily: 'monospace' } }}
      />

      <Button
        variant="contained"
        onClick={submit}
        color="primary"
        style={{ marginTop: '2rem' }}
      >
        Mettre à jour req.session.user
      </Button>
    </Fragment>
  )
}
