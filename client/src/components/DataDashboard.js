import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DateRangePicker from './DateRangePicker';
import Search from './Search';

class DataDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
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
          <Search
            data={this.props.data}
            searchType={this.props.searchType}
            onSearchTargetSelected={this.props.onSearchTargetSelected}
            clearFilterButtonDisabled={this.props.clearFilterButtonDisabled}
            clearFilterButtonOnClick={this.props.clearFilterButtonOnClick}
          />
        </div>
        <DateRangePicker
          onDateRangePicked={this.props.onDateRangePicked}
          minDate={moment(data[0].Date, 'M/DD/YY')}
          maxDate={moment(data[data.length - 1].Date, 'M/DD/YY')}
        />
      </div>
    );
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
};

export default DataDashboard;
