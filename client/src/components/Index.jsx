import React, { Component } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Jumbotron } from 'react-bootstrap';

class Index extends Component {
  render() {
    return (
      <Jumbotron>
        <h1>Simplist</h1>
        <p className="lead">Real-time collaborative lists made easy</p>
        <LinkContainer to="/create">
          <Button bsSize="large" bsStyle="success">
            Create new list
          </Button>
        </LinkContainer>
      </Jumbotron>
    );
  }
}

export default Index;
