import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataHeader from '../components/DataHeader';
import DataPlaceholder from '../components/DataPlaceholder';
import WatchData from './WatchData';
import EmotionData from './EmotionData';
import MediaData from './MediaData';
import SmsData from './SmsData';
import DeviceData from './DeviceData';
import MusicData from './MusicData';

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

  setDisplayString = (displayString) => {
    this.setState({ displayString });
  }

  renderData = () => {
    const { displayMode } = this.props;
    if (displayMode === '') return (
      <DataPlaceholder />
    );
    if (displayMode === 'watch') return (
      <WatchData setDisplayString={this.setDisplayString} />
    );
    if (displayMode === 'emotion') return (
      <EmotionData setDisplayString={this.setDisplayString} />
    );
    if (displayMode === 'media') return (
      <MediaData setDisplayString={this.setDisplayString} />
    );
    if (displayMode === 'sms') return (
      <SmsData setDisplayString={this.setDisplayString} />
    );
    if (displayMode === 'device') return (
      <DeviceData setDisplayString={this.setDisplayString} />
    );
    if (displayMode === 'music') return (
      <MusicData setDisplayString={this.setDisplayString} />
    );
  }

  render() {
    return (
      <div className="data-container">
        <DataHeader displayString={this.state.displayString} />
        {this.renderData()}
      </div>
    );
  }
}

DataDisplay.propTypes = {
  displayMode: PropTypes.string.isRequired,
};

export default DataDisplay;
