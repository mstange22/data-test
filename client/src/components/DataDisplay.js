import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataHeader from './DataHeader';
import WatchData from './WatchData';
import EmotionData from './EmotionData';
import MediaUploadsData from './MediaUploadsData';

class DataDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMode: '',
      displayString: '',
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.props.displayMode !== newProps.displayMode) {
      this.setState({ displayMode: newProps.displayMode });
    }
  }

  renderData = () => {
    const { displayMode } = this.props;
    if (displayMode === '') return null;
    if (displayMode === 'watch') return (
      <WatchData setDisplayString={displayString => this.setState({ displayString })} />
    );
    if (displayMode === 'emotion') return (
      <EmotionData setDisplayString={displayString => this.setState({ displayString })} />
    );
    if (displayMode === 'media_uploads') return (
      <MediaUploadsData setDisplayString={displayString => this.setState({ displayString })} />
    );
  }

  render() {
    return (
      <div>
        <DataHeader displayString={this.state.displayString} />
        {this.renderData()}
      </div>
    );
  }
}

DataDisplay.propTypes = {
  displayMode: PropTypes.string.isRequired,
}

export default DataDisplay;
