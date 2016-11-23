import React from 'react';

import { FormGroup, FormControl } from 'react-bootstrap';
import List from './List';


export default class NewList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      items: [],
    };
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      items: this.state.items.concat([this.state.value]),
      value: '',
    });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup
          controlId="formBasicText"
        >
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="Add an item..."
            onChange={this.handleChange}
          />
          <FormControl.Feedback />
        </FormGroup>

        <pre>
          {JSON.stringify(this.state)}
        </pre>
        <List items={this.state.items} />
      </form>
    );
  }
}
