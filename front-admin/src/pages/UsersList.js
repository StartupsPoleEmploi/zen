/* eslint-disable no-alert */
/* eslint-disable no-confirm */

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'

import UsersTable from '../components/UsersTable'

export const UsersList = () => {
  const [users, setUsers] = useState([])
  const [showAuthorizedUsers, toggleAuthorizedUsers] = useState(false)
  const [selectedUsersIds, setSelectedUsersIds] = useState([])

  const fetchUsers = () =>
    superagent
      .get(
        `/zen-admin-api/users?authorized=${
          showAuthorizedUsers ? 'true' : 'false'
        }`,
      )
      .then(({ body }) => {
        setUsers(body)
      })

  useEffect(() => {
    fetchUsers()
  }, [showAuthorizedUsers])

  if (users.length === 0) return null

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Liste d'utilisateurs</h1>
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={showAuthorizedUsers}
              onChange={() => toggleAuthorizedUsers(!showAuthorizedUsers)}
            />
          }
          label={`Utilisateurs ${showAuthorizedUsers ? '' : ' non '} autorisés`}
        />
        <br />
        <Button
          href={`/zen-admin-api/users?csv&authorized=${
            showAuthorizedUsers ? 'true' : 'false'
          }`}
          variant="contained"
          color="primary"
        >
          Télécharger un extract des utilisateurs{' '}
          {showAuthorizedUsers ? '' : 'non'} autorisés
        </Button>
        <br />
        <UsersTable
          allowSelection={!showAuthorizedUsers}
          users={users}
          selectedUsersIds={selectedUsersIds}
          setSelectedUsersIds={setSelectedUsersIds}
        />
      </div>
    </div>
  )
}

UsersList.propTypes = {}

export default UsersList
