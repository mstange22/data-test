import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import DeviceSearch from './DeviceSearch';
import WatcherSearch from './WatcherSearch';
import AccountIdSearch from './AccountIdSearch';
import {
  setSearchValue,
  setCurrentFamilyCode,
  setCurrentWatcherId,
  setCurrentDeviceId,
} from '../redux/actions';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleClearFilterButtonClick = (e) => {
    e.preventDefault();
    this.props.setCurrentFamilyCode('');
    this.props.setCurrentWatcherId(0);
    this.props.setCurrentDeviceId(0);
    this.props.setSearchValue('');
  }

  render() {
    const { data, onSearchTargetSelected } = this.props;
    let search;
    switch (this.props.searchType) {
      case 'device':
        search = (
          <DeviceSearch
            deviceData={data}
            onDeviceSelected={onSearchTargetSelected}
            value={this.state.value}
          />
        );
        break;
      case 'watcher':
        search = (
          <WatcherSearch
            activeUserData={data}
            onWatcherSelected={onSearchTargetSelected}
            value={this.state.value}
          />
        );
        break;
      case 'account':
          search = (
            <AccountIdSearch
              activeUserData={data}
              onAccountIdSelected={onSearchTargetSelected}
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
          disabled={
            this.props.currentFamilyCode === ''
            && this.props.currentDeviceId === 0
            && this.props.currentWatcherId === 0
          }
          onClick={this.handleClearFilterButtonClick}
        >
          Clear Filter
        </Button>
      </div>
    );
  }
}

Search.propTypes = {
  data: PropTypes.array.isRequired,
  onSearchTargetSelected: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentFamilyCode: state.currentFamilyCode,
  currentWatcherId: state.currentWatcherId,
  currentDeviceId: state.currentDeviceId,
});

const mapDispatchToProps = {
  setSearchValue,
  setCurrentFamilyCode,
  setCurrentWatcherId,
  setCurrentDeviceId,
};
export default connect(mapStateToProps, mapDispatchToProps)(Search);