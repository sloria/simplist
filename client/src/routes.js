// src/routes.js
import React from 'react';
import { Router, Route } from 'react-router';

import App from './components/App';
import Index from './components/Index';
import ListCreate from './components/ListCreate';
import ListDetail from './components/ListDetail';
import NotFound from './components/NotFound';

const Routes = props => (
  <Router {...props}>
    <Route path="/" component={Index} />

    <Route path="/" component={App} >
      <Route path="/lists/:listID" component={ListDetail} />
      <Route path="/create" component={ListCreate} />
    </Route>
    <Route path="*" component={NotFound} />
  </Router>
);

export default Routes;
