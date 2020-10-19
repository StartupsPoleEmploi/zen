// @flow

import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { URLS } from './common/routes';
import ActivityLogs from './containers/ActivityLogs';
import Declarations from './containers/Declarations';
import Declaration from './containers/Declaration';
import Settings from './containers/Settings';
import User from './containers/User';
import Users from './containers/Users';
import Useradmins from './containers/Useradmins';
import UseradminAdd from './containers/Useradmin/Useradmin.add';
import UseradminEdit from './containers/Useradmin/Useradmin.edit';
import Dashboard from './containers/Dashboard';

const Routes = () => (
  <Switch>
    <Route path={URLS.BASE} exact component={Dashboard} />
    <Route path={URLS.DECLARATIONS.BASE} exact component={Declarations} />
    <Route path={URLS.DECLARATIONS.VIEW} exact component={Declaration} />
    <Route path={URLS.ACTIVITIES} exact component={ActivityLogs} />
    <Route path={URLS.SETTINGS} exact component={Settings} />
    <Route path={URLS.USERS.BASE} exact component={Users} />
    <Route path={URLS.USERS.VIEW} exact component={User} />
    <Route path={URLS.USERADMINS.BASE} exact component={Useradmins} />
    <Route path={URLS.USERADMINS.ADD} exact component={UseradminAdd} />
    <Route path={URLS.USERADMINS.EDIT} exact component={UseradminEdit} />

    <Redirect to="/dashboard" />
  </Switch>
);

export default Routes;
