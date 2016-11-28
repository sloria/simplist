import React from 'react';

import Footer from './Footer';
import './App.css';

const FOOTER_HEIGHT = 100;

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div style={{ minHeight: window.innerHeight - FOOTER_HEIGHT }} className="container">
          {this.props.children}
        </div>
        <Footer />
      </div>
    );
  }
}
