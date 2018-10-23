import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import DateRangePicker from '../components/DateRangePicker';
import DeviceSearch from '../components/DeviceSearch';
import WatcherSearch from '../components/WatcherSearch';

class DataDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  renderSearch = () => {
    const { data, activeUserData, onSearchTargetSelected } = this.props;
    let search;
    switch (this.props.searchType) {
      case 'device':
        search = (
          <DeviceSearch
            deviceData={data}
            onDeviceSelected={onSearchTargetSelected}
          />
        );
        break;
      case 'emotion':
        search = (
          <WatcherSearch
            activeUserData={data}
            activeWatcherAccounts={activeUserData}
            onWatcherSelected={onSearchTargetSelected}
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
          onClick={this.props.clearFilterButtonOnClick}
        >
          Clear Filter
        </Button>
      </div>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <div className="data-dashboard">
        <div className="form-input-container">
          {this.props.checkboxes.map(checkbox => (
            <label key={checkbox.label} className="checkbox-label">
              <input
                name={checkbox.name}
                type="checkbox"
                checked={checkbox.checked}
                onChange={checkbox.onChange}
              />
              {checkbox.label}
            </label>
          ))}
          {this.renderSearch()}
        </div>
        <DateRangePicker
          onDateRangePicked={this.props.onDateRangePicked}
          minDate={moment(data[0].Date, 'M/DD/YY')}
          maxDate={moment(data[data.length - 1].Date, 'M/DD/YY')}
        />
      </div>
    )
  }
}

DataDashboard.propTypes = {
  data: PropTypes.array.isRequired,
  activeUserData: PropTypes.array,
  checkboxes: PropTypes.array.isRequired,
  searchType: PropTypes.string,
  onDateRangePicked: PropTypes.func.isRequired,
  onSearchTargetSelected: PropTypes.func.isRequired,
  clearFilterButtonDisabled: PropTypes.bool.isRequired,
  clearFilterButtonOnClick: PropTypes.func.isRequired,
}

export default DataDashboard;
