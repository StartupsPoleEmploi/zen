// @flow

import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';


import { URLS } from '../../common/routes';
import ActivityLogs from '../ActivityLogs';
import Actualisations from '../Actualisations';
import Settings from '../Settings';


const Routes = () => (
  <Switch>
    <Route path={URLS.ACTUALISATIONS} exact component={Actualisations} />
    <Route path={URLS.ACTIVITIES} exact component={ActivityLogs} />
    <Route path={URLS.SETTINGS} exact component={Settings} />

    <Redirect to="/dashboard" />
  </Switch>
);

export default Routes;
