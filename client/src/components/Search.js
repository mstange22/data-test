import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import DeviceSearch from './DeviceSearch';
import WatcherSearch from './WatcherSearch';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }

  handleClearFilterButtonClick = (e) => {
    e.preventDefault();
    this.props.clearFilterButtonOnClick();
    this.setState({ value: '' })
  }

  render() {
    const { data, activeUserData, onSearchTargetSelected } = this.props;
    let search;
    switch (this.props.searchType) {
      case 'device':
        search = (
          <DeviceSearch
            deviceData={data}
            onDeviceSelected={onSearchTargetSelected}
            setSearchValue={(value) => this.setState({ value })}
            value={this.state.value}
          />
        );
        break;
      case 'watcher':
        search = (
          <WatcherSearch
            activeUserData={data}
            activeWatcherAccounts={activeUserData}
            onWatcherSelected={onSearchTargetSelected}
            setSearchValue={(value) => this.setState({ value })}
            value={this.state.value}
          />
        );
        break;
      default:
        break;
    }
    return (
      <div className="search-container">
        {search}
        <Button
          id="clear-filter-btn"
          bsStyle="default"
          disabled={this.props.clearFilterButtonDisabled}
          onClick={this.handleClearFilterButtonClick}
        >
          Clear Filter
        </Button>
      </div>
    );
  }
}

Search.PropTypes = {
  data: PropTypes.array.isRequired,
  activeUserData: PropTypes.array,
  onSearchTargetSelected: PropTypes.func.isRequired,
  clearFilterButtonDisabled: PropTypes.func.isRequired,
  clearFilterButtonOnClick: PropTypes.func.isRequired,
}

export default Search;