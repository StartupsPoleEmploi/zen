/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useCallback } from 'react';
import superagent from 'superagent';

import { useUseradmin } from './useradminCtx';

const UsersContext = React.createContext();

export function UsersProvider(props) {
  const [isLoading, _setIsLoading] = useState(false);
  const [users, _setUsers] = useState([]);
  const [showAuthorizedUsers, setAuthorizedUsers] = useState(true);
  const { logoutIfNeed } = useUseradmin();

  const fetchUsers = useCallback(async () => {
    _setIsLoading(true);
    superagent
      .get(`/zen-admin-api/users?authorized=${showAuthorizedUsers ? 'true' : 'false'}`)
      .then(({ body }) => _setUsers(body))
      .catch(logoutIfNeed)
      .finally(() => _setIsLoading(false));
  }, [logoutIfNeed, showAuthorizedUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <UsersContext.Provider
      {...props}
      value={{
        users,
        showAuthorizedUsers,
        isLoading,
        // function
        setAuthorizedUsers,
        fetchUsers,
      }}
    />
  );
}

export const useUsers = () => {
  const context = React.useContext(UsersContext);
  if (!context) throw new Error('useUsers must be used in UsersProvider');

  return context;
};
