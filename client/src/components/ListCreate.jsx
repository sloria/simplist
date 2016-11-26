import React from 'react';

import Client from '../Client';


export default class ListCreate extends React.Component {
  /**
   * Upon mounting, create a new list, then redirect to the list detail
   */
  componentDidMount() {
    const router = this.props.router;
    Client.createList({ title: 'Untitled List' })
      .then((json) => {
        router.replace(`/lists/${json._id}`);
      });
  }
  render() {
    return (
      <h1>Creating new list...</h1>
    );
  }
}
