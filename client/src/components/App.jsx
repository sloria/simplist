import React from 'react';

import GitHubRibbon from './GitHubRibbon';
import './App.css';


export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          {this.props.children}
        </div>
        <GitHubRibbon repo="sloria/simplist" />
      </div>
    );
  }
}
