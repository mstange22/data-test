import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import DateRangePicker from './DateRangePicker';
import Search from './Search';
import { clearSearch } from '../redux/actions';

class DataDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onCheckboxChange = (e) => {
    this.props.clearSearch();
    this.props.checkboxes[0].onChange(e);
  }

  render() {
    const { data, checkboxes } = this.props;
    return (
      <div className="data-dashboard">
        <div className="form-input-container">
          {checkboxes && checkboxes.map(checkbox => (
            <label key={checkbox.label} className="checkbox-label">
              <input
                name={checkbox.name}
                type="checkbox"
                checked={checkbox.checked}
                onChange={this.onCheckboxChange}
              />
              {checkbox.label}
            </label>
          ))}
          <Search
            data={this.props.data}
            searchType={this.props.searchType}
            onSearchTargetSelected={this.props.onSearchTargetSelected}
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
  checkboxes: PropTypes.array,
  searchType: PropTypes.string,
  onDateRangePicked: PropTypes.func.isRequired,
  onSearchTargetSelected: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
});

const mapDispatchToProps = {
  clearSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(DataDashboard);
