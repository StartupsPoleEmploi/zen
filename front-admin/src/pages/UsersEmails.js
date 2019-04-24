/* eslint-disable no-alert */
/* eslint-disable no-confirm */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */
/* eslint-disable react/no-array-index-key */

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { chunk } from 'lodash'
import React, { useState } from 'react'
import superagent from 'superagent'

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const UsersEmails = () => {
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState('')
  const [emailsToCheck, setEmailsToCheck] = useState([])
  const [errors, setErrors] = useState([])

  const getEmailsArray = (string) =>
    string
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.match(EMAIL_REGEX))

  const authorizeUsersbByEmails = async () => {
    if (!window.confirm(`Autoriser ces utilisateurs ?`)) {
      return
    }

    let addedUsersNb = 0
    const newErrors = []
    const newEmailsToCheck = []

    const allEmailsArray = getEmailsArray(emails)
    const allEmailsArrayInChunks = chunk(allEmailsArray, 50)

    setLoading(true)

    for (const emailsChunk of allEmailsArrayInChunks) {
      await superagent
        .post(`/zen-admin-api/users/authorize`, { emails: emailsChunk })
        .then(({ body: { updatedRowsNb } }) => {
          addedUsersNb += updatedRowsNb
        })
        .catch((err) => {
          newErrors.push(err)
          newEmailsToCheck.push(...emailsChunk)
        })
    }

    setLoading(false)
    setEmailsToCheck(newEmailsToCheck)
    setErrors(newErrors)

    window.alert(`${addedUsersNb} utilisateurs ont été ajoutés.
${
  newErrors.length > 0
    ? `Il y a eu des erreurs, merci d'en donner le détail aux développeurs`
    : ''
}
    `)
  }

  if (loading) {
    return <div style={{ textAlign: 'center' }}>Chargement…</div>
  }

  return (
    <div style={{ textAlign: 'center' }}>
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
      <div>
        {errors.map((error, key) => (
          <Typography key={key} style={{ color: 'red' }}>
            <b>{error.message}</b>
          </Typography>
        ))}
        {emailsToCheck.length > 0 && (
          <Typography>
            <b>Vérifier ces e-mails manuellement :</b>
          </Typography>
        )}
        <ul>
          {emailsToCheck.map((email, key) => (
            <li key={`${email}-${key}`}>
              <Typography>{email}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

UsersEmails.propTypes = {}

export default UsersEmails
