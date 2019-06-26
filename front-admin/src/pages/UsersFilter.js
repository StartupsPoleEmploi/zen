/* eslint-disable no-alert */
/* eslint-disable no-confirm */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */
/* eslint-disable react/no-array-index-key */

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import React, { useState } from 'react'
import superagent from 'superagent'

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const UsersFilter = () => {
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState('')
  const [error, setError] = useState('')
  const [filteredEmails, setFilteredEmails] = useState([])

  const getEmailsArray = (string) =>
    string
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.match(EMAIL_REGEX))

  const authorizeUsersbByEmails = async () => {
    const emailArray = getEmailsArray(emails)
    if (emailArray.length === 0) return

    setLoading(true)

    await superagent
      .post(`/zen-admin-api/users/filter`, { emails: emailArray })
      .then(({ body }) => {
        setFilteredEmails(body)
      })
      .catch((err) => {
        setError(err)
      })

    setLoading(false)
  }

  if (loading) {
    return <div style={{ textAlign: 'center' }}>Chargement…</div>
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Filtre d'utilisateurs</h1>
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
          Valider
        </Button>
      </div>
      <div>
        {error && (
          <Typography role="alert" style={{ color: 'red' }}>
            <b>{error.message}</b>
          </Typography>
        )}
        {filteredEmails.length > 0 && (
          <Typography>
            <b>E-mails absents de la base de données :</b>
          </Typography>
        )}
        <ul style={{ listStyle: 'none' }}>
          {filteredEmails.map((email, key) => (
            <li key={`${email}-${key}`}>
              <Typography>{email}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

UsersFilter.propTypes = {}

export default UsersFilter
