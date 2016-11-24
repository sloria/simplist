import React, { PropTypes as t } from 'react';


function ListItem(props) {
  const { content, ...rest } = props;
  return (
    <li {...rest}>{content}</li>

  );
}

export default class List extends React.Component {
  static propTypes = {
    items: t.arrayOf(t.object),
  }
  render() {
    // TODO: Use an actual key
    return (
      <ul>
        {this.props.items.map((item) => {
          return (
            <ListItem content={item.content} key={item.id} />
          );
        })}
      </ul>
    );
  }
}
