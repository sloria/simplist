import React from 'react';
import { IndexLink } from 'react-router';


export default class App extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="header clearfix">
          <nav>
            <ul className="nav nav-pills pull-right">
              <li role="presentation"><IndexLink to="/">Home</IndexLink></li>
            </ul>
          </nav>
          <h3 className="text-muted">Simplist</h3>
        </div>
        {this.props.children}
      </div>
    );
  }
}
