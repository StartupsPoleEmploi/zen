/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import superagent from 'superagent';

import { useUseradmin } from './useradminCtx';

async function fetchUsers(showAuthorizedUsers) {
  return superagent
    .get(`/zen-admin-api/users?authorized=${showAuthorizedUsers ? 'true' : 'false'}`)
    .then(({ body }) => body);
}

const UsersContext = React.createContext();

export function UsersProvider(props) {
  const [isLoading, _setIsLoading] = useState(false);
  const [users, _setUsers] = useState([]);
  const [showAuthorizedUsers, setAuthorizedUsers] = useState(true);
  const { logoutIfNeed } = useUseradmin();

  useEffect(() => {
    _setIsLoading(true);
    fetchUsers(showAuthorizedUsers)
      .then(_setUsers)
      .catch(logoutIfNeed)
      .finally(() => _setIsLoading(false));
  }, [logoutIfNeed, showAuthorizedUsers]);

  return (
    <UsersContext.Provider
      {...props}
      value={{
        users,
        showAuthorizedUsers,
        isLoading,
        // function
        setAuthorizedUsers,
      }}
    />
  );
}

export const useUsers = () => {
  const context = React.useContext(UsersContext);
  if (!context) throw new Error('useUsers must be used in UsersProvider');

  return context;
};
