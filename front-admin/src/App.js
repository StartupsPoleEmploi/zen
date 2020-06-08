// @flow

import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Layout } from 'antd';
import superagent from 'superagent';

import Routes from './Routes';
import ZnMenuLayout from './components/ZnMenuLayout';
import { MENU_ITEMS } from './common/routes';
import imgLogo from './assets/images/logoFull.svg';
import { DeclarationsProvider } from './common/contexts/declarationsCtx';
import { UsersProvider } from './common/contexts/usersCtx';
import { useUseradmin } from './common/contexts/useradminCtx';
import Login from './containers/Login';

const browserHistory = createBrowserHistory({
  basename: '/zen-admin',
});

async function logout() {
  return superagent.post('/zen-admin-api/logout');
}

export default function App() {
  const { useradmin, setUseradmin } = useUseradmin();
  if (!useradmin) return <Login />;


  const logoutCallback = async () => {
    await logout();
    setUseradmin();
  };

  const logoutElem = {
    name: 'Logout',
    iconName: 'logout',
    onClick: logoutCallback,
    key: 'logout',
  };

  return (
    <Router history={browserHistory}>
      <Layout style={{ height: '100vh', minWidth: '1024px', overflowX: 'auto' }}>
        <Layout.Sider width={240} trigger={null}>
          <ZnMenuLayout
            links={[
              ...MENU_ITEMS.filter((e) => e.access.includes(useradmin.type)),
              logoutElem,
            ]}
            logo={imgLogo}
          />
        </Layout.Sider>
        <Layout>
          <DeclarationsProvider>
            <UsersProvider>
              <Routes />
            </UsersProvider>
          </DeclarationsProvider>
        </Layout>
      </Layout>
    </Router>
  );
}
