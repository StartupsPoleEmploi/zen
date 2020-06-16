import React from 'react';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import UseradminsList from './UseradminsList';

export default function Users() {
  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Utilisateurs admin" />
      <ZnContent>
        <UseradminsList />
      </ZnContent>
    </div>
  );
}
