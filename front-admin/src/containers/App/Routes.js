// @flow

import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';


import { URLS } from '../../common/routes';
import ActivityLogs from '../ActivityLogs';
import Actualisations from '../Actualisations';


const Routes = () => (
  <Switch>
    <Route path={URLS.ACTUALISATIONS} exact component={Actualisations} />
    <Route path={URLS.ACTIVITES} exact component={ActivityLogs} />

    <Redirect to="/dashboard" />
  </Switch>
);

export default Routes;
