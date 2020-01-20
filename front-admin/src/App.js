// @flow

import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Layout } from 'antd';

import Routes from './Routes';
import ZnMenuLayout from './components/ZnMenuLayout';
import { MENU_ITEMS } from './common/routes';
import imgLogo from './assets/images/logoFull.svg';
import { DeclarationsProvider } from './common/contexts/declarationsCtx';
import { UsersProvider } from './common/contexts/usersCtx';

const browserHistory = createBrowserHistory({
  basename: '/zen-admin',
});

export default function App() {
  return (
    <Router history={browserHistory}>
      <Layout style={{ height: '100vh', minWidth: '1024px', overflowX: 'auto' }}>
        <Layout.Sider width={240} trigger={null}>
          <ZnMenuLayout
            links={MENU_ITEMS}
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
