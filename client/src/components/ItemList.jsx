import React from 'react';
import { PropTypes as t } from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import ListItem from './ListItem';

import './ItemList.css';

const SortableListItem = SortableElement(props => <ListItem {...props} />);

class ItemList extends React.Component {
  static propTypes = {
    items: t.arrayOf(t.object),
    onItemChecked: t.func.isRequired,
    onMenuItemClick: t.func.isRequired,
    finishEditing: t.func.isRequired,
  }
  state = {
    sortingDisabled: false,
  }
  // Disable sorting when an item is right-clicked
  handleMenuShow = () => {
    this.setState({ sortingDisabled: true });
  }
  handleMenuHide = () => {
    this.setState({ sortingDisabled: false });
  }
  render() {
    return (
      <ul className="ItemList">
        {this.props.items.map((item, index) => {
          return (
            <SortableListItem
              index={index}
              editing={item.editing || false}
              itemID={item._id}
              onMenuShow={this.handleMenuShow}
              onMenuHide={this.handleMenuHide}
              disabled={this.state.sortingDisabled}
              onItemChecked={this.props.onItemChecked}
              finishEditing={this.props.finishEditing}
              cancelEditing={this.props.cancelEditing}
              onMenuItemClick={this.props.onMenuItemClick}
              checked={item.checked}
              content={item.content}
              key={item._id}
            />
          );
        })}
      </ul>
    );
  }
}

export default SortableContainer(ItemList);
