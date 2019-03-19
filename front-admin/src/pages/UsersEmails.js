/* eslint-disable no-alert */
/* eslint-disable no-confirm */

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import React, { useState } from 'react'
import superagent from 'superagent'

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const UsersEmails = () => {
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState('')

  const getEmailsArray = (string) =>
    string
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.match(EMAIL_REGEX))

  const authorizeUsersbByEmails = () => {
    const emailsArray = getEmailsArray(emails)

    if (
      !window.confirm(
        `Autoriser ces utilisateurs (${emailsArray.join(', ')}) ?`,
      )
    ) {
      return
    }

    setLoading(true)

    superagent
      .post(`/zen-admin-api/users/authorize`, { emails: emailsArray })
      .then(({ body: { updatedRowsNb } }) =>
        window.alert(`
${updatedRowsNb} utilisateurs ont été validés.
Si ce nombre ne paraît pas cohérent, copier la liste d'e-mails et la transmettre au développeur.
`),
      )
      .catch((err) => window.alert(`Erreur : ${err.message}`))
      .then(() => setLoading(false))
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {loading && <div>Chargement…</div>}
      <div style={{ margin: 'auto', width: '30rem' }}>
        <div>
          <Typography>
            {getEmailsArray(emails).length} e-mails détectés
          </Typography>
          <TextField
            multiline
            rows="15"
            margin="normal"
            variant="outlined"
            placeholder="Copier ici des e-mails"
            onChange={(e) => setEmails(e.target.value)}
            value={emails}
            fullWidth
          />
        </div>
        <Button
          onClick={authorizeUsersbByEmails}
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        >
          Autoriser les nouveaux utilisateurs
        </Button>
      </div>
    </div>
  )
}

UsersEmails.propTypes = {}

export default UsersEmails
