import Button from '@material-ui/core/Button'
import React, { useState } from 'react'

import UsersList from './UsersList'
import UsersEmails from './UsersEmails'
import UsersFilter from './UsersFilter'

export const Users = () => {
  const [showUsersPage, setShowUserPage] = useState(true)
  const [showEmailsPage, setShowEmailsPage] = useState(false)
  const [showFilterPage, setShowFilterPage] = useState(false)

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '50rem',
          margin: 'auto',
        }}
      >
        <Button
          variant="outlined"
          color={showUsersPage ? 'primary' : 'default'}
          onClick={() => {
            setShowUserPage(true)
            setShowEmailsPage(false)
            setShowFilterPage(false)
          }}
        >
          Liste d'utilisateurs
        </Button>
        <Button
          variant="outlined"
          color={showEmailsPage ? 'primary' : 'default'}
          onClick={() => {
            setShowUserPage(false)
            setShowEmailsPage(true)
            setShowFilterPage(false)
          }}
        >
          Ajout d'utilisateurs par e-mail
        </Button>
        <Button
          variant="outlined"
          color={showFilterPage ? 'primary' : 'default'}
          onClick={() => {
            setShowUserPage(false)
            setShowEmailsPage(false)
            setShowFilterPage(true)
          }}
        >
          Filtre d'e-mails
        </Button>
      </div>
      {showUsersPage && <UsersList />}
      {showEmailsPage && <UsersEmails />}
      {showFilterPage && <UsersFilter />}
    </div>
  )
}

Users.propTypes = {}

export default Users
