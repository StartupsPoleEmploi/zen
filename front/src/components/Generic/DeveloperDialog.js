import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import TextField from '@material-ui/core/TextField'
import { omit } from 'lodash'
import React, { Fragment, useEffect, useState } from 'react'
import superagent from 'superagent'

import CustomDialog from './CustomDialog'

const ESCAPE_KEY_CODE = 27

/*
  This dialog's objective is to provide a better development experience.
  As such, unlike others components, it handles its own display logic
  and ajax calls in order not to pollute others parts of the code
  with dev-only logic.
  This should not be replicated to others components.
 */
const DeveloperDialog = () => {
  const [csrfToken, setCsrfToken] = useState(null)
  const [sessionUser, setSessionUser] = useState('')
  const [error, setError] = useState(null)
  const [isDisplayed, setDisplayed] = useState(false)

  const submit = () => {
    try {
      superagent
        .post('/api/developer/session/user', JSON.parse(sessionUser))
        .set('CSRF-Token', csrfToken)
        .then(() => window.location.reload(true))
        .catch((err) => setError(`Erreur serveur : ${err}`))
    } catch (err) {
      return setError(`Le JSON est invalide : ${err}`)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.keyCode !== ESCAPE_KEY_CODE) return

      setDisplayed(!isDisplayed)
    })

    superagent.get('/api/developer/session/user').then(({ body }) => {
      setCsrfToken(body.csrfToken)
      setSessionUser(JSON.stringify(omit(body, 'csrfToken'), null, 2))
    })
  }, [])

  if (!isDisplayed) return null

  return (
    <CustomDialog
      content={
        <Fragment>
          <DialogContentText paragraph>
            Permet de changer <code>req.session.user</code> côté back (JSON).
            <br />
            Exemple à réutiliser :
          </DialogContentText>
          <pre style={{ textAlign: 'left', fontSize: '1.4rem' }}>
            <code>
              {`{
  "id": 510,
  "firstName": "Harry",
  "lastName": "Pisces",
  "email": "harry@pisces.com",
  "gender": "female",
  "isAuthorized": true,
  "isBlocked": true,
  "canSendDeclaration": true,
  "hasAlreadySentDeclaration": false,
  "tokenExpirationDate": "2059-05-06T13:34:15.985Z"
}`}
            </code>
          </pre>
          {error && (
            <DialogContentText paragraph style={{ color: 'red' }}>
              {error}
            </DialogContentText>
          )}
          <TextField
            label="JSON"
            rowsMax="25"
            value={sessionUser}
            onChange={(e) => setSessionUser(e.target.value)}
            variant="outlined"
            multiline
            fullWidth
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />
        </Fragment>
      }
      actions={
        <Fragment>
          <Button variant="contained" onClick={submit} color="primary">
            Mettre à jour req.session.user
          </Button>
        </Fragment>
      }
      title="Modal Développeur"
      titleId="DevDialogContentText"
      isOpened
      onCancel={() => setDisplayed(false)}
    />
  )
}

export default DeveloperDialog
