import React from 'react';
import { IndexLink, Link } from 'react-router';


export default class App extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="header clearfix">
          <nav>
            <ul className="nav nav-pills pull-right">
              <li role="presentation"><Link to="/create">Create list</Link></li>
            </ul>
          </nav>
          <h3 className="text-muted"><IndexLink to="/">Simplist</IndexLink></h3>
        </div>
        {this.props.children}
      </div>
    );
  }
}
