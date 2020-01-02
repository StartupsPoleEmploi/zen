// @flow

import React, { useState, useEffect } from 'react';
import superagent from 'superagent';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import UserInfos from './components/UserInfos';
import UserActivityLogs from './components/UserActivityLogs';
import UserDeclarations from './components/UserDeclarations';

type Props = {
  match: Object,
}

export default function User({ match }: Props) {
  const [user, setUser] = useState(null);
  const { id: userId } = match.params;

  useEffect(() => {
    superagent
      .get(`/zen-admin-api/users/${userId}`)
      .then(({ body }) => setUser(body));
  }, [userId]);


  return (
    <div>
      <ZnHeader title={`Utilisateurs ${userId}`} />
      <ZnContent>
        {user ? (
          <>
            <h2 style={{ textAlign: 'center' }}>{`${user.firstName} ${user.lastName}`}</h2>
            <UserInfos user={user} />
            <UserDeclarations declarations={user.declarations} />
            <UserActivityLogs activityLogs={user.activityLogs} />
          </>
        )
          : <h3 style={{ textAlign: 'center', margin: '20px' }}>Loading ...</h3>}
      </ZnContent>
    </div>
  );
}
