import React from 'react';
import Nes from 'nes/client';
import { FormGroup, FormControl } from 'react-bootstrap';
import { RIEInput } from 'riek';

import Client from '../Client';
import ItemList from './ItemList';
import ErrorMessage from './ErrorMessage';

import { updateInArray } from '../utils';
import config from '../../../config';

const websocketURI = config.env === 'production' ? `ws://${config.domain}` : `ws://localhost:${config.port}`;
const client = new Nes.Client(websocketURI);

function ListDetail(props) {
  const items = props.items;
  return (
    <div>
      <h3>
        <RIEInput value={props.title} change={props.onTitleChanged} propName="title" />
      </h3>
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
        <ItemList
          onMenuItemClick={props.onMenuItemClick}
          onItemChecked={props.onItemChecked}
          finishEditing={props.finishEditing}
          cancelEditing={props.cancelEditing}
          items={items} />
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
      error: null,
    };
  }
  componentDidMount() {
    const listID = this.props.params.listID;
    Client.getList(listID)
      .then((json) => {
        this.setState({
          title: json.title,
          items: json.items || [],
        });
      })
      .catch((error) => {
        this.setState({ error });
      });

    client.connect(() => {
      function handler(payload) {
        this.setState({ title: payload.title, items: payload.items });
      }
      client.subscribe(`/s/lists/${listID}`, handler.bind(this), (err) => {
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

  handleMenuItemClick = (e, itemID, action) => {
    const listID = this.props.params.listID;
    const menuActions = {
      delete: () => {
        Client.deleteItem({ listID, itemID });
        this.setState({ items: this.state.items.filter(item => item.id !== itemID) });
      },
      edit: () => {
        const items = this.state.items;
        const newItems = updateInArray(items, item => item.id === itemID, (oldItem) => {
          return { editing: true };
        });
        this.setState({ items: newItems });
      }
    };

    menuActions[action]();
  }

  finishEditing = (itemID, newValue) => {
    const listID = this.props.params.listID;
    const items = this.state.items;
    const newItems = updateInArray(items, item => item.id === itemID, (oldItem) => {
      return { editing: false, content: newValue };
    });
    this.setState({ items: newItems });
    Client.editItem({ listID, itemID, data: { content: newValue } });
  }

  cancelEditing = (itemID) => {
    const items = this.state.items;
    const newItems = updateInArray(items, item => item.id === itemID, (oldItem) => {
      return { editing: false };
    });
    this.setState({ items: newItems });
  }

  handleTitleChanged = (data) => {
    const title = data.title || 'Untitled list';
    this.setState({ title });
    const listID = this.props.params.listID;
    Client.updateList({ id: listID, data: { title } });
  }

  render() {
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} />
    }
    return (
      <ListDetail
        onTitleChanged={this.handleTitleChanged}
        onItemChecked={this.handleItemChecked}
        onMenuItemClick={this.handleMenuItemClick}
        finishEditing={this.finishEditing}
        cancelEditing={this.cancelEditing}
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
