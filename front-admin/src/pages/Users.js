import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'

import UsersTable from '../components/UsersTable'

export const Users = () => {
  const [users, setUsers] = useState([])
  const [showAuthorizedUsers, toggleAuthorizedUsers] = useState(false)
  const [selectedUsersIds, setSelectedUsersIds] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const authorizeUsers = () => {
    const selectedUsersNames = selectedUsersIds
      .map((id) => {
        const user = users.find((u) => u.id === id)
        return `${user.firstName} ${user.lastName}`
      })
      .join(', ')
    if (
      !window.confirm(`Autoriser ces utilisateurs (${selectedUsersNames}) ?`)
    ) {
      return
    }

    setError(null)
    setLoading(true)

    superagent
      .post(`/zen-admin-api/users/authorize`, { ids: selectedUsersIds })
      .then(fetchUsers)
      .catch(setError)
      .then(() => setLoading(false))
  }

  useEffect(
    () => {
      fetchUsers()
    },
    [showAuthorizedUsers],
  )

  if (users.length === 0) return null

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Utilisateurs</h1>
      {error && (
        <div>
          Il y a eu une erreur pendant l'autorisation des utilisateurs.
          Réessayer devrait résoudre le problème. Dans le cas contraire,
          contacter le développeur.
        </div>
      )}
      {loading && <div>Chargement…</div>}
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
      {!showAuthorizedUsers && (
        <Button
          onClick={authorizeUsers}
          disabled={selectedUsersIds.length === 0}
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        >
          Autoriser les nouveaux utilisateurs
        </Button>
      )}
      <UsersTable
        allowSelection={!showAuthorizedUsers}
        users={users}
        selectedUsersIds={selectedUsersIds}
        setSelectedUsersIds={setSelectedUsersIds}
      />
    </div>
  )
}

Users.propTypes = {}

export default Users
