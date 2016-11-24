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
    this.props.onItemChecked(this.props.id);
  }
  handleMouseOver = () => {
    this.setState({ displayControls: true });
  }
  handleMouseOut = () => {
    this.setState({ displayControls: false });
  }
  render() {
    return (
      <li className="ListItem" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
        <Checkbox
          onChange={this.handleItemChecked}
          checked={this.props.checked}
        >
          <ReactMarkdown containerTagName="span" source={this.props.content} />
        </Checkbox>
        {/* {this.state.displayControls ? '[ Delete ]' : ''} */}

        {/* <pre>{JSON.stringify(this.state)}</pre> */}
      </li>
    );
  }
}
