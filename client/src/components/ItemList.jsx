import React, { PropTypes as t } from 'react';

import ListItem from './ListItem';

import './ItemList.css';


export default class ItemList extends React.Component {
  static propTypes = {
    items: t.arrayOf(t.object),
    onItemChecked: t.func.isRequired,
    onMenuItemClick: t.func.isRequired,
  }
  render() {
    return (
      <ul className="ItemList">
        {this.props.items.map((item) => {
          return (
            <ListItem
              editing={item.editing || false}
              id={item.id}
              onItemChecked={this.props.onItemChecked}
              finishEditing={this.props.finishEditing}
              cancelEditing={this.props.cancelEditing}
              onMenuItemClick={this.props.onMenuItemClick}
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
