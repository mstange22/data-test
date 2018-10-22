import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import DateRangePicker from '../components/DateRangePicker';
import DeviceSearch from '../components/DeviceSearch';

class DataDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  renderSearch = () => {
    const { data } = this.props;
    let search;
    switch (this.props.searchType) {
      case 'device':
        search = (
          <DeviceSearch
            deviceData={data}
            onDeviceSelected={this.props.onSearchTargetSelected}
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
          disabled={this.state.currentFamilyCode === '' && this.state.currentWatcherId === 0}
          onClick={() => this.setState({ currentFamilyCode: '', currentWatcherId: 0})}
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
  checkboxes: PropTypes.array.isRequired,
  searchType: PropTypes.string,
  onDateRangePicked: PropTypes.func.isRequired,
  onSearchTargetSelected: PropTypes.func.isRequired,
  clearFilterButtonDisabled: PropTypes.bool.isRequired,
  clearFilterButtonOnClick: PropTypes.func.isRequired,
}

export default DataDashboard;
