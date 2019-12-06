// @flow

import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Layout } from 'antd';

import Routes from './Routes';
import ZnMenuLayout from '../../components/ZnMenuLayout';
import { MENU_ITEMS } from '../../common/routes';
import imgLogo from '../../assets/images/logoFull.svg';

const browserHistory = createBrowserHistory({
  basename: '/zen-admin',
});

export default function App() {
  return (
    <Router history={browserHistory}>
      <Layout style={{ height: '100vh' }}>
        <Layout.Sider width={240} trigger={null}>
          <ZnMenuLayout
            links={MENU_ITEMS}
            logo={imgLogo}
          />
        </Layout.Sider>
        <Layout><Routes /></Layout>
      </Layout>
    </Router>
  );
}
