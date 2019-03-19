import Button from '@material-ui/core/Button'
import React, { useState } from 'react'

import UsersList from './UsersList'
import UsersEmails from './UsersEmails'

export const Users = () => {
  const [showUsersList, setShowUserList] = useState(true)

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '30rem',
          margin: 'auto',
        }}
      >
        <Button
          variant="outlined"
          color={showUsersList ? 'primary' : 'default'}
          onClick={() => setShowUserList(true)}
        >
          Liste d'utilisateurs
        </Button>
        <Button
          variant="outlined"
          color={!showUsersList ? 'primary' : 'default'}
          onClick={() => setShowUserList(false)}
        >
          Copie d'e-mails
        </Button>
      </div>
      <h1>Utilisateurs</h1>
      {showUsersList ? <UsersList /> : <UsersEmails />}
    </div>
  )
}

Users.propTypes = {}

export default Users
