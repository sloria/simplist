import React from 'react';
import Nes from 'nes/client';
import { FormGroup, FormControl } from 'react-bootstrap';
import { RIEInput } from 'riek';

import Client from '../Client';
import ItemList from './ItemList';

import { updateInArray } from '../utils';

const client = new Nes.Client('ws://localhost:3001');

function ListDetail(props) {
  const items = props.items;
  return (
    <div>
      <h3>
        <RIEInput value={props.title} change={props.onTitleChanged} propName="title" />
      </h3>
      {/* <h3>{props.title}</h3> */}
      <form onSubmit={props.onSubmit}>
        <FormGroup controlId="formBasicText">
          <FormControl
            type="text"
            value={props.value}
            placeholder="Add an item..."
            onChange={props.onChange}
            autoFocus
          />
          <FormControl.Feedback />
        </FormGroup>

        {/* <pre> {JSON.stringify(props, null, 2)}</pre> */}
        <ItemList onItemChecked={props.onItemChecked} items={items} />
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
        console.log('Websocket payload:');
        console.log(payload);
        this.setState({ title: payload.title, items: payload.items });
      }
      client.subscribe(`/lists/${listID}`, handler.bind(this), (err) => {
        if (err) { throw err; }
      });
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

  handleItemChecked = (itemID) => {
    const listID = this.props.params.listID;
    const items = this.state.items;
    const newItems = updateInArray(items, item => item.id === itemID, (oldItem) => {
      return { checked: !oldItem.checked };
    });
    this.setState({ items: newItems });
    Client.toggleItem({ listID, itemID });
  }

  handleTitleChanged = (data) => {
    const title = data.title || 'Untitled list';
    this.setState({ title });
    const listID = this.props.params.listID;
    Client.updateList({ id: listID, data: { title } });
  }

  render() {
    return (
      <ListDetail
        onTitleChanged={this.handleTitleChanged}
        onItemChecked={this.handleItemChecked}
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
