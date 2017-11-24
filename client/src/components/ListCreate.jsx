import React from 'react';
import { Link } from 'react-router';

import Header from './Header';
import Client from '../Client';

export default class ListCreate extends React.Component {
  state = {
    loaderVisible: false,
  }
  /**
   * Upon mounting, create a new list, then redirect to the list detail
   */
  async componentDidMount() {
    const router = this.props.router;
    const json = await Client.createList({ title: 'Untitled List' });
    router.replace(`/lists/${json._id}`);
    // Only show loading indicator for slow (> 500ms) responses
    setTimeout(() => {
      this.setState({ loaderVisible: true });
    }, 500);
  }
  render() {
    const navLinks = [
      <Link to="/create">New list</Link>,
    ];
    return (
      <div className="ListCreate">
        <Header navLinks={navLinks}>
          <h4 className="ListCreate-title text-muted">
            Untitled List
          </h4>
        </Header>
        <h4
          className="ListCreate-loader text-muted"
          style={{ display: this.state.loaderVisible ? 'block' : 'none' }}
        >
          Creating new list...
        </h4>
      </div>
    );
  }
}
