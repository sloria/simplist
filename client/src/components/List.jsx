import React, { PropTypes as t } from 'react';


export class ListItem extends React.Component {
  render() {
    const { text, ...props } = this.props;
    return (
      <li {...props}>{text}</li>

    );
  }
}

export default class List extends React.Component {
  static propTypes = {
    items: t.arrayOf(t.string),
  }
  render() {
    // TODO: Use an actual key
    return (
      <ul>
        {this.props.items.map((item) => {
          return (
            <ListItem text={item} key={item} />
          );
        })}
      </ul>
    );
  }
}
