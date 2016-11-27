import React from 'react';
import Nes from 'nes/client';
import { FormGroup, FormControl, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RIEInput } from 'riek';
import { Link } from 'react-router';
import { arrayMove } from 'react-sortable-hoc';

import Client from '../Client';
import ItemList from './ItemList';
import ErrorMessage from './ErrorMessage';
import Header from './Header';

import { updateInArray } from '../utils';
import config from '../../../shared-config';
import './ListDetail.css';

const websocketURI = config.env === 'production' ? `ws://${config.domain}` : `ws://localhost:${config.port}`;
const nesClient = new Nes.Client(websocketURI);

function ListDetail(props) {
  const items = props.items;

  const navLinks = [
    <Link to="/create">New list</Link>,
  ];
  const editableTitle = (
    <h4 className="ListDetail-title text-muted">
      <RIEInput value={props.title} change={props.onTitleChanged} propName="title" />
    </h4>
  );
  let titleContent;
  if (props.title === 'Untitled List') {
    const titleTooltip = (
      <Tooltip id="tooltip">Click to edit</Tooltip>
    );
    titleContent = (
      <OverlayTrigger delayShow={800} placement="left" overlay={titleTooltip}>
        {editableTitle}
      </OverlayTrigger>
    );
  } else {
    titleContent = editableTitle;
  }
  return (
    <div className="ListDetail">
      <Header navLinks={navLinks}>
        {titleContent}
      </Header>
      <form className="ListDetail-addform" onSubmit={props.onSubmit}>
        <FormGroup controlId="formBasicText">
          <FormControl
            type="text"
            value={props.value}
            placeholder="Add an item..."
            onChange={props.onChange}
            autoFocus
          />
        </FormGroup>
      </form>
        {items.length ? <ItemList
          onSortEnd={props.onSortEnd}
          disabled={true}
          lockAxis={'y'}
          onMenuItemClick={props.onMenuItemClick}
          onItemChecked={props.onItemChecked}
          finishEditing={props.finishEditing}
          cancelEditing={props.cancelEditing}
          items={items}
        /> : ''}
    </div>
  );
}


export default class ListDetailContainer extends React.Component {
  state = {
    title: '',
    value: '',
    items: [],
    error: null,
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

    nesClient.connect(() => {
      function handler(payload) {
        this.setState({ title: payload.title, items: payload.items });
      }
      nesClient.subscribe(`/s/lists/${listID}`, handler.bind(this), (err) => {
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
    const newItems = updateInArray(items, item => item._id === itemID, (oldItem) => {
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
        this.setState({ items: this.state.items.filter(item => item._id !== itemID) });
      },
      edit: () => {
        const items = this.state.items;
        const newItems = updateInArray(items, item => item._id === itemID, () => {
          return { editing: true };
        });
        this.setState({ items: newItems });
      },
    };

    menuActions[action]();
  }

  finishEditing = (itemID, newValue) => {
    const listID = this.props.params.listID;
    const items = this.state.items;
    const newItems = updateInArray(items, item => item._id === itemID, () => {
      return { editing: false, content: newValue };
    });
    this.setState({ items: newItems });
    Client.editItem({ listID, itemID, data: { content: newValue } });
  }

  cancelEditing = (itemID) => {
    const items = this.state.items;
    const newItems = updateInArray(items, item => item._id === itemID, () => {
      return { editing: false };
    });
    this.setState({ items: newItems });
  }

  handleTitleChanged = (data) => {
    const title = data.title || 'Untitled List';
    this.setState({ title });
    const listID = this.props.params.listID;
    Client.updateList({ id: listID, data: { title } });
  }

  handleSortEnd = ({ oldIndex, newIndex }) => {
    const reorderedItems = arrayMove(this.state.items, oldIndex, newIndex);
    this.setState({
      items: reorderedItems,
    });
    const itemIDs = reorderedItems.map(item => item._id);
    const listID = this.props.params.listID;
    Client.updateList({ id: listID, data: { items: itemIDs }});
  }

  render() {
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} />;
    }
    return (

      <ListDetail
        onSortEnd={this.handleSortEnd}
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
