import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DateRange } from 'react-date-range';
// import 'react-date-range/dist/styles.css'; // main style file
// import 'react-date-range/dist/theme/default.css'; // theme css file

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  handleDateChange = (date) => {
    console.log('date picker date:', date);
    if (moment(date.endDate).diff(date.startDate, 'days') > 0) {
      console.log('diff!');
      document.getElementById('chart-container').innerHTML = '';
      this.props.onDateRangePicked({ startDate: date.startDate, endDate: date.endDate })
    }
  }

  render() {
    return (
      <div className="date-picker-container">
        <DateRange
          onChange={this.handleDateChange}
          minDate={this.props.minDate}
          maxDate={this.props.maxDate}
          // minDate={moment(activeUserEmotionData[0].Date, 'M/DD/YY')}
          // maxDate={moment(activeUserEmotionData[activeUserEmotionData.length - 1].Date, 'M/DD/YY')}
        />
      </div>
    );
  }
}

DateRangePicker.propTypes = {
  onDateRangePicked: PropTypes.func.isRequired,
  minDate: PropTypes.object.isRequired,
  maxDate: PropTypes.object.isRequired,
}

export default DateRangePicker;