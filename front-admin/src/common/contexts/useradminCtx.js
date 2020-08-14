/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback } from 'react';
import superagent from 'superagent';
import { useHistory } from 'react-router-dom';
import { notification } from 'antd';

import { URLS } from '../routes';

const UseradminContext = React.createContext();

export function UseradminProvider(props) {
  const [useradmin, _setUseradmin] = useState(null);
  const history = useHistory();

  const login = useCallback(async ({ email, password }) => {
    const data = await superagent
      .post('/zen-admin-api/login', { email, password })
      .then(({ body }) => body)
      .catch((err) => {
        if (err.response && err.response.statusCode) {
          notification.error({
            message: 'E-mail ou mot de passe incorrect',
            description:
              "Pour plus d'information veuillez prendre contact avec Sylvie Lebel.",
          });
        }
      });
    _setUseradmin(data);
  }, []);

  const autologin = useCallback(async () => {
    const data = await superagent
      .get('/zen-admin-api/autologin')
      .then(({ body }) => body)
      .catch(() => null);
    _setUseradmin(data);
  }, []);

  const logout = useCallback(async () => {
    await superagent.post('/zen-admin-api/logout');
    _setUseradmin();
  }, []);

  const logoutIfNeed = useCallback(async (error) => {
    if (error.status === 401) {
      await logout();
    } else if (error.status === 403) {
      await logout();
      history.replace(URLS.DASHBOARD);
    } else {
      throw error;
    }
  }, [history, logout]);

  return (
    <UseradminContext.Provider
      {...props}
      value={{
        useradmin,
        login,
        autologin,
        logout,
        logoutIfNeed,
      }}
    />
  );
}

export const useUseradmin = () => {
  const context = React.useContext(UseradminContext);
  if (!context) throw new Error('useUseradmin must be used in UseradminProvider');

  return context;
};
