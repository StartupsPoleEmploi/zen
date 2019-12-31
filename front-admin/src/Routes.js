// @flow

import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { URLS } from './common/routes';
import ActivityLogs from './containers/ActivityLogs';
import Declarations from './containers/Declarations';
import Settings from './containers/Settings';
import User from './containers/User';
import Users from './containers/Users';

const Routes = () => (
  <Switch>
    <Route path={URLS.DECLARATIONS} exact component={Declarations} />
    <Route path={URLS.ACTIVITIES} exact component={ActivityLogs} />
    <Route path={URLS.SETTINGS} exact component={Settings} />
    <Route path={URLS.USERS.BASE} exact component={Users} />
    <Route path={URLS.USERS.VIEW} exact component={User} />

    <Redirect to="/dashboard" />
  </Switch>
);

export default Routes;
