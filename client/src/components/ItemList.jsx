import React, { PropTypes as t } from 'react';

import ListItem from './ListItem';

import './ItemList.css';


export default class ItemList extends React.Component {
  static propTypes = {
    items: t.arrayOf(t.object),
    onItemChecked: t.func.isRequired,
  }
  handleItemChecked = (itemID) => {
    this.props.onItemChecked(itemID);
  }
  render() {
    return (
      <ul className="ItemList">
        {this.props.items.map((item) => {
          return (
            <ListItem
              id={item.id}
              onItemChecked={this.handleItemChecked}
              checked={item.checked}
              content={item.content}
              key={item.id}
            />
          );
        })}
      </ul>
    );
  }
}
