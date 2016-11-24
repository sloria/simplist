import React from 'react';
import Nes from 'nes/client';
import { FormGroup, FormControl } from 'react-bootstrap';

import Client from '../Client';
import List from './List';

const client = new Nes.Client('ws://localhost:3001');

function ListDetail(props) {
  const items = props.items;
  return (
    <div>
      <h3>{props.title}</h3>
      <form onSubmit={props.onSubmit}>
        <FormGroup controlId="formBasicText">
          <FormControl
            type="text"
            value={props.value}
            placeholder="Add an item..."
            onChange={props.onChange}
          />
          <FormControl.Feedback />
        </FormGroup>

        <pre> {JSON.stringify(props, null, 2)}</pre>
        <List items={items} />
      </form>
    </div>
  );
}


export default class ListDetailContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      value: '',
      items: [],
    };
  }
  componentDidMount() {
    const listID = this.props.params.listID;

    fetch(`/api/lists/${listID}`)
      .then(resp => resp.json())
      .then((json) => {
        this.setState({
          title: json.title,
          items: json.items || [],
        });
      });
    client.connect(() => {
      function handler(payload) {
        this.setState({ items: payload.items });
      }
      client.subscribe(`/lists/${listID}`, handler.bind(this), () => {});
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const content = this.state.value;
    const listID = this.props.params.listID;
    Client.addItemToList({ id: listID, content })
      .then((json) => {
        this.setState({ items: json.items });
      });
    this.setState({
      value: '',
    });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <ListDetail
        title={this.state.title}
        items={this.state.items}
        value={this.state.value}
        listID={this.props.params.listID}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
      />
    );
  }
}
