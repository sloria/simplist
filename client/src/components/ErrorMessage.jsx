import React, { PropTypes as t } from 'react';

const messages = {
  404: 'List not found',
  500: 'Unexpected error occurred. Please try again later.',
};

export default class ErrorMessage extends React.Component {
  static propTypes = {
    error: t.object.isRequired,
  }
  render() {
    const status = this.props.error.response ? this.props.error.response.status : 500;
    return (
      <h1>{status} <small>{messages[status]}</small></h1>
    );
  }
}
