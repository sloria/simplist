// src/routes.js
import React from 'react';
import { Router, IndexRoute, Route } from 'react-router';

import App from './components/App';
import Index from './components/Index';
import NewList from './components/NewList';
import NotFound from './components/NotFound';

const Routes = props => (
  <Router {...props}>
    <Route path="/" component={App} >
      <IndexRoute component={Index} />
      <Route path="new" component={NewList} />
    </Route>
    <Route path="*" component={NotFound} />
  </Router>
);

export default Routes;
