import React from 'react';
import { FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import FAIcon from './FAIcon';

import './ListItem.css';
import './ContextMenu.css';

function FieldGroup({ id, ...props }) {
  return (
    <FormGroup controlId={id}>
      <FormControl {...props} />
    </FormGroup>
  );
}

export default class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayControls: false,
      value: props.content,
    };
  }
  // FIXME: Make this work
  componentDidUpdate(prevProps) {
    const inputElem = this.inputElem;
    if (inputElem && this.props.editing && !prevProps.editing) {
      inputElem.focus();
      // this.selectInputText(inputElem);
    }
  }
  handleItemChecked = () => {
    this.props.onItemChecked(this.props.itemID);
  }
  handleDelete = (e) => {
    this.props.onMenuItemClick(e, this.props.itemID, 'delete');
  }
  handleEdit = (e) => {
    this.props.onMenuItemClick(e, this.props.itemID, 'edit');
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }
  handleKeyDown = (event) => {
    if (event.keyCode === 13) { // Enter
      this.props.finishEditing(this.props.itemID, this.state.value);
    } else if (event.keyCode === 27) {  // Esc
      this.props.cancelEditing(this.props.itemID, this.state.value);
    }
  }
  handleBlur = () => {
    this.props.finishEditing(this.props.itemID, this.state.value);
  }
  render() {
    const menuID = `${this.props.itemID}__menu`;
    let content;
    if (this.props.editing) {
      content = (
        <FieldGroup
          id={`editItem-${this.props.itemID}`}
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
          ref={node => this.inputElem = node}
        />
      );
    } else {
      content = (
        <ContextMenuTrigger id={menuID}>
          {this.props.content}
        </ContextMenuTrigger>
      );
    }

    const menu = (
      <ContextMenu id={menuID}>
        <MenuItem onClick={this.handleEdit}>
          <FAIcon type="edit" className="text-muted" />&nbsp;
          Edit
        </MenuItem>

        <MenuItem onClick={this.handleDelete}>
          <FAIcon type="trash" className="text-muted" />&nbsp;
          Delete
        </MenuItem>
      </ContextMenu>
    );

    return (
      <li className="ListItem">
        <Checkbox
          onChange={this.handleItemChecked}
          checked={this.props.checked || false}
        >
          {content}
        </Checkbox>
        {menu}
      </li>
    );
  }
}
