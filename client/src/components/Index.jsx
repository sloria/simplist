import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Jumbotron } from 'react-bootstrap';

import Header from './Header';
import Footer from './Footer';
import './Index.css';

class Index extends Component {
  render() {
    const navLinks = [
      <Link to="/create">Create list</Link>,
    ];
    return (
      <div className="Index">
        <div className="container">
          <Header navLinks={navLinks}>
            <h3>Simplist</h3>
          </Header>
          <Jumbotron>
            <h1>Simplist</h1>
            <small>
              <p><span className="text-muted">Real-time collaborative lists in</span> one click</p>
            </small>
            <LinkContainer to="/create">
              <Button bsSize="large" bsStyle="success">
                Create new list
              </Button>
            </LinkContainer>
          </Jumbotron>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Index;
