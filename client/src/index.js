import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';

import Routes from './routes';  // eslint-disable-line

import './index.css';

ReactDOM.render(
  <Routes history={browserHistory} />,
  document.getElementById('root')
);
