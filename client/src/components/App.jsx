import React from 'react';

import './App.css';


export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          {this.props.children}
        </div>
      </div>
    );
  }
}
