import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Button,
  Jumbotron,
  Row,
  Col,
} from 'react-bootstrap';

import Header from './Header';
import Footer from './Footer';
import Icon from './FAIcon';
import './Index.css';

const FOOTER_HEIGHT = 100;

class Index extends Component {
  render() {
    const navLinks = [
      <Link className="text-success" to="/create">New list</Link>,
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
              <p><span className="text-muted">Real-time collaborative lists in</span> one click <Icon type="mouse-pointer" /></p>
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
          <Row className="marketing">
            <Col md={6}>
              <ul>
                <li><Icon type="check-square-o" /> Gift lists</li>
                <li><Icon type="check-square-o" /> Group brainstorming</li>
                <li><Icon type="check-square-o" /> Shared to-do lists</li>
                <li><Icon type="check-square-o" /> Real-time updates</li>
                <li><Icon type="check-square-o" /> Supports <a href="https://daringfireball.net/projects/markdown/">Markdown</a></li>
              </ul>
            </Col>
          </Row>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Index;
