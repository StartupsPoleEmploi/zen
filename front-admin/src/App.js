// @flow

import React from 'react';
import { Layout } from 'antd';

import Routes from './Routes';
import ZnMenuLayout from './components/ZnMenuLayout';
import { MENU_ITEMS } from './common/routes';
import imgLogo from './assets/images/logoFull.svg';
import { DeclarationsProvider } from './common/contexts/declarationsCtx';
import { UsersProvider } from './common/contexts/usersCtx';
import { useUseradmin } from './common/contexts/useradminCtx';
import Login from './containers/Login';


export default function App() {
  const { useradmin, logout } = useUseradmin();
  if (!useradmin) return <Login />;

  const logoutElem = {
    name: 'Logout',
    iconName: 'logout',
    onClick: logout,
    key: 'logout',
  };

  return (
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
  );
}
