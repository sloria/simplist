import React, { PropTypes as t } from 'react';
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
  render() {
    return (
      <ul className="ItemList">
        {this.props.items.map((item, index) => {
          return (
            <SortableListItem
              index={index}
              editing={item.editing || false}
              itemID={item._id}
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
