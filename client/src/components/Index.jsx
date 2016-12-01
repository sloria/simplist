import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Jumbotron } from 'react-bootstrap';

import Header from './Header';
import Footer from './Footer';
import './Index.css';

const FOOTER_HEIGHT = 100;

class Index extends Component {
  render() {
    const navLinks = [
      <Link to="/create">Create list</Link>,
    ];
    return (
      <div className="Index">
        <div style={{ minHeight: window.innerHeight - FOOTER_HEIGHT }} className="container">
          <Header navLinks={navLinks}>
            <h3 className="brand">Simplist</h3>
          </Header>
          <Jumbotron>
            <h1 className="brand">Simplist</h1>
            <small>
              <p><span className="text-muted">Real-time collaborative lists in</span> one click</p>
            </small>
            <LinkContainer to="/create">
              <Button bsSize="large" bsStyle="success">
                Create new list
              </Button>
            </LinkContainer>
            <div className="text-muted">
              <p><small>No signup required</small></p>
            </div>
          </Jumbotron>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Index;
