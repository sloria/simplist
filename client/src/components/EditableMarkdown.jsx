import React, { PropTypes as t } from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  FormGroup,
  FormControl,
} from 'react-bootstrap';
import Markdown from 'react-markdown';

export default class EditableMarkdown extends React.Component {
  static defaultProps = {
    rows: 5,
  }
  static propTypes = {
    value: t.string.isRequired,
    emptyContent: t.string,
    rows: t.number,
  }
  state = {
    editing: false,
    value: this.props.value,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  componentDidUpdate(prevProps, prevState) {
    var inputElem = ReactDOM.findDOMNode(this.refs.input);
    if (this.state.editing && !prevState.editing) {
      inputElem.focus();
      // this.selectInputText(inputElem);
    }
  }
  getEditElement = () => {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows={this.props.rows}
            value={this.state.value}
            placeholder="Enter a description..."
            ref="input"
            onChange={event => this.setState({ value: event.target.value })}
          />
        </FormGroup>
        <Button className="pull-right" bsStyle="success" type="submit">Save</Button>
        <Button
          onClick={this.cancelEditing}
          className="pull-right"
          bsStyle="default"
        >Cancel</Button>
      </form>
    );
  }
  getRenderedElement = () => {
    const value = this.props.value || this.props.emptyContent;
    return (
      <div style={{ cursor: 'pointer' }} onClick={this.enableEditing}>
        <Markdown escapeHtml source={value} />
      </div>
    );
  }
  cancelEditing = () => {
    this.setState({ editing: false, value: this.props.value });
  }
  enableEditing = () => {
    this.setState({ editing: true });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.finishEditing(this.state.value);
    this.setState({ editing: false });
  }
  render() {
    return (
      <div className="EditableMarkdown">
        {this.state.editing ? this.getEditElement() : this.getRenderedElement()}
      </div>
    );
  }
}

