// @flow

import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';


import { URLS } from './common/routes';
import ActivityLogs from './containers/ActivityLogs';
import Actualisations from './containers/Actualisations';
import Settings from './containers/Settings';
import Users from './containers/Users';


const Routes = () => (
  <Switch>
    <Route path={URLS.ACTUALISATIONS} exact component={Actualisations} />
    <Route path={URLS.ACTIVITIES} exact component={ActivityLogs} />
    <Route path={URLS.SETTINGS} exact component={Settings} />
    <Route path={URLS.USERS.BASE} exact component={Users} />

    <Redirect to="/dashboard" />
  </Switch>
);

export default Routes;
