import React from 'react';
import Nes from 'nes/client';
import {
  FormGroup,
  FormControl,
  OverlayTrigger,
  Popover,
  Label,
  Tooltip,
  Row,
  Col,
} from 'react-bootstrap';
import { RIEInput } from 'riek';
import { Link } from 'react-router';
import { arrayMove } from 'react-sortable-hoc';
import TimeAgo from 'timeago.js';

import Client from '../Client';
import ItemList from './ItemList';
import EditableMarkdown from './EditableMarkdown';
import ErrorMessage from './ErrorMessage';
import Header from './Header';
import CopyInput from './CopyInput';

import { updateInArray } from '../utils';
import config from '../../../shared-config';
import './ListDetail.css';

const websocketURI = config.env === 'production' ? `ws://${config.domain}` : `ws://localhost:${config.port}`;
const nesClient = new Nes.Client(websocketURI);
const timeago = new TimeAgo();

function AddItemInput({ onSubmit, onChange, value }) {
  return (
    <form className="ListDetail-addform" onSubmit={onSubmit}>
      <FormGroup controlId="formBasicText">
        <FormControl
          type="text"
          value={value}
          placeholder="Add an item..."
          onChange={onChange}
          autoFocus
        />
      </FormGroup>
    </form>
  );
}

function getListURL(listID) {
  const domain = window.location.hostname + (window.location.port ? `:${window.location.port}` : '');
  return `http://${domain}/lists/${listID}`;
}

function ListDetail(props) {
  const { items, listID } = props;
  const description = props.description;
  const linkURL = getListURL(listID);
  const sharePopover = (
    <Popover id="sharePopover" title="List URL">
      <CopyInput buttonID="shareButtonID" inputID="shareInputID" value={linkURL} />
    </Popover>
  );

  const shareButton = (
    <OverlayTrigger trigger="click" placement="bottom" overlay={sharePopover}>
      <a href={undefined}>Share this list</a>
    </OverlayTrigger>
  );

  const labelTooltip = (
    <Tooltip id="publicTooltip">
      <strong>This list is PUBLIC.</strong>&nbsp;
      Any changes you make will be seen by anyone viewing this list.
    </Tooltip>
  );
  const label = (
    <OverlayTrigger trigger="hover" delayShow={800} placement="bottom" overlay={labelTooltip}>
      <Label className="ListDetail-label">Public</Label>
    </OverlayTrigger>
  );
  const navLinks = [
    { content: label, navProps: { className: 'Header-label' } },
    shareButton,
    <Link className="text-success" to="/create">New list</Link>,
  ];
  const titleContent = (
    <span>
      <h4>
        <span className="brand"><Link to="/">Simplist</Link></span>&nbsp; | &nbsp;
        <span className="ListDetail-title">
          <RIEInput value={props.title} change={props.onTitleChanged} propName="title" />
        </span>
      </h4>
    </span>
  );

  let updatedAtDisplay;
  if (props.updatedAt && props.updatedAt !== props.createdAt) {
    const updatedAtDateText = timeago.format(props.updatedAt || props.createdAt);
    updatedAtDisplay = (
      <Row>
        <Col md={12}>
          <small className="ListDetail-updatedat text-muted pull-right">Updated {updatedAtDateText}</small>
        </Col>
      </Row>
    );
  } else {
    updatedAtDisplay = '';
  }
  return (
    <div className="ListDetail">
      <Header navLinks={navLinks}>
        {titleContent}
      </Header>
      {description != null ?
        <div className="ListDetail-description">
          <EditableMarkdown
            value={description}
            emptyContent="*Click here to edit description*"
            finishEditing={props.onEditDescription}
          />
        </div> : ''
      }
      {updatedAtDisplay}
      <AddItemInput value={props.value} onSubmit={props.onSubmit} onChange={props.onChange} />
      {items.length ? <ItemList
        onSortEnd={props.onSortEnd}
        lockAxis={'y'}
        pressDelay={200}
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
    createdAt: null,
    updatedAt: null,
    items: [],
    error: null,
    description: '',
  }
  componentDidMount() {
    const listID = this.listID = this.props.params.listID;
    Client.getList(listID)
      .then((json) => {
        this.setState({
          title: json.title,
          createdAt: json.createdAt,
          updatedAt: json.updatedAt,
          items: json.items || [],
          description: json.description,
        });
        document.title = `Simplist | ${json.title}`;
      })
      .catch((error) => {
        this.setState({ error });
      });

    nesClient.connect().then(() => {
      function handler(payload) {
        this.setState(payload);
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
    const pageTitle = `Simplist | ${title}`;
    document.title = pageTitle;
    this.setState({ title });
    const listID = this.props.params.listID;
    Client.updateList({ id: listID, data: { title } }).then(() => {
      document.title = pageTitle;
    });
  }

  handleSortEnd = ({ oldIndex, newIndex }) => {
    const reorderedItems = arrayMove(this.state.items, oldIndex, newIndex);
    this.setState({
      items: reorderedItems,
    });
    const itemIDs = reorderedItems.map(item => item._id);
    const listID = this.props.params.listID;
    Client.updateList({ id: listID, data: { items: itemIDs } });
  }

  handleEditDescription = (newContent) => {
    this.setState({
      description: newContent,
    });
    Client.updateList({ id: this.listID, data: { description: newContent } });
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
        updatedAt={this.state.updatedAt}
        createdAt={this.state.createdAt}
        description={this.state.description}
        listID={this.props.params.listID}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
        onEditDescription={this.handleEditDescription}
      />
    );
  }
}
