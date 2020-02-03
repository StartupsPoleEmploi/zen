import React from 'react';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import UsersList from './UsersList';

export default function Users() {
  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Utilisateurs" />
      <ZnContent>
        <UsersList />
      </ZnContent>
    </div>
  );
}
