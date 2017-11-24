import React from 'react';
import { PropTypes as t } from 'prop-types';
import {
  FormGroup,
  InputGroup,
  FormControl,
  Button,
} from 'react-bootstrap';
import Clipboard from 'clipboard';

import FAIcon from './FAIcon';
import './CopyInput.css';

export default class CopyInput extends React.Component {
  static propTypes = {
    value: t.string.isRequired,
    inputID: t.string.isRequired,
    buttonID: t.string.isRequired,
  }
  componentDidMount() {
    const { buttonID, inputID } = this.props;

    const buttonIdSelector = `#${buttonID}`;
    this.clipboard = new Clipboard(
      buttonIdSelector, {
        target: () => document.getElementById(inputID),
      }
    );
  }
  render() {
    const {
      buttonID,
      inputID,
      value,
    } = this.props;

    return (
      <FormGroup className="CopyInput">
        <InputGroup>
          <FormControl id={inputID} value={value} readOnly type="text" />
          <InputGroup.Button>
            <Button id={buttonID}><FAIcon type="copy" /></Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
}
