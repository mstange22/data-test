import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import DeviceSearch from './DeviceSearch';
import WatcherSearch from './WatcherSearch';
import AccountIdSearch from './AccountIdSearch';
import { clearSearch } from '../redux/actions';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleClearFilterButtonClick = (e) => {
    e.preventDefault();
    this.props.clearSearch('');
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
            data={data}
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
  clearSearch: PropTypes.func.isRequired,
  searchType: PropTypes.string.isRequired,
  currentFamilyCode: PropTypes.string.isRequired,
  currentWatcherId: PropTypes.number.isRequired,
  currentDeviceId: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  currentFamilyCode: state.currentFamilyCode,
  currentWatcherId: state.currentWatcherId,
  currentDeviceId: state.currentDeviceId,
});

const mapDispatchToProps = {
  clearSearch,
};
export default connect(mapStateToProps, mapDispatchToProps)(Search);