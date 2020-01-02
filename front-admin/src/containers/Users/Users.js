import { Button } from 'antd';
import React, { useState } from 'react';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import UsersList from './UsersList';
import UsersEmails from './UsersEmails';

export default function Users() {
  const [showUsersPage, setShowUserPage] = useState(true);
  const [showEmailsPage, setShowEmailsPage] = useState(false);

  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Utilisateurs" />
      <ZnContent>
        <Button
          variant="outlined"
          color={showUsersPage ? 'primary' : 'default'}
          onClick={() => {
            setShowUserPage(true);
            setShowEmailsPage(false);
          }}
        >
          Liste d'utilisateurs
        </Button>
        <Button
          variant="outlined"
          color={showEmailsPage ? 'primary' : 'default'}
          onClick={() => {
            setShowUserPage(false);
            setShowEmailsPage(true);
          }}
        >
          Ajout d'utilisateurs par e-mail
        </Button>
        {showUsersPage && <UsersList />}
        {showEmailsPage && <UsersEmails />}
      </ZnContent>
    </div>
  );
}
