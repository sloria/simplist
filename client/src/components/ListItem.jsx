import React from 'react';
import { Checkbox } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import './ListItem.css';

export default class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayControls: false,
    };
  }
  handleItemChecked = () => {
    this.props.onItemChecked.bind(this, this.props.id);
  }
  handleMouseOver = () => {
    this.setState({ displayControls: true });
  }
  handleMouseOut = () => {
    this.setState({ displayControls: false });
  }
  render() {
    const { content, checked, ...rest } = this.props;
    return (
      <li className="ListItem" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
        <Checkbox
          onChange={this.handleItemChecked}
          checked={checked} {...rest}
        >
          <ReactMarkdown containerTagName="span" source={content} />
        </Checkbox>
        {this.state.displayControls ? '[ Delete ]' : ''}

        {/* <pre>{JSON.stringify(this.state)}</pre> */}
      </li>
    );
  }
}
