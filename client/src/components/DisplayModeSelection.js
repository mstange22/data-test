import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DisplayModeSelection extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="display-mode-selector-container">
        <label className="radio-label">
          <input
            name="radio-watcher"
            type="radio"
            checked={this.props.displayMode === 'watcherId'}
            onChange={this.props.handleRadioButtonChange}
          />
          {'Watcher Id'}
        </label>
        <label className="radio-label">
          <input
            name="radio-watcher"
            type="radio"
            checked={this.props.displayMode === 'familyCode'}
            onChange={this.props.handleRadioButtonChange}
          />
          {'Family Code'}
        </label>
      </div>
    );
  }
}

DisplayModeSelection.propTypes = {
  displayMode: PropTypes.string.isRequired,
  handleRadioButtonChange: PropTypes.func.isRequired,
};

export default DisplayModeSelection;
