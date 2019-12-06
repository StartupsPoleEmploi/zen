// @flow

import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';


import { URLS } from '../../common/routes';
import {
  Actualisations,
} from '..';

const Routes = () => (
  <Switch>
    <Route path={URLS.ACTUALISATIONS} exact component={Actualisations} />

    <Redirect to="/dashboard" />
  </Switch>
);

export default Routes;
