import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Jumbotron } from 'react-bootstrap';

import GitHubRibbon from './GitHubRibbon';
import Header from './Header';

class Index extends Component {
  render() {
    const navLinks = [
      <Link to="/create">Create list</Link>,
    ];
    return (
      <div className="Index">
        <div className="container">
          <Header navLinks={navLinks}>
            <h3 className="text-muted">Simplist</h3>
          </Header>
          <Jumbotron>
            <h1>Simplist</h1>
            <p className="lead">Real-time collaborative lists in one click</p>
            <LinkContainer to="/create">
              <Button bsSize="large" bsStyle="success">
                Create new list
              </Button>
            </LinkContainer>
          </Jumbotron>
        </div>
        <GitHubRibbon repo="sloria/simplist" />
      </div>
    );
  }
}

export default Index;
