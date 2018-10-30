import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class KpiData extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.kpiData.length === nextProps.kpiData.length) return false;
    return true;
  }

  getDisplayColor = (curr, prev) => {
    if (curr > prev) return ' success';
    if (curr < prev) return ' danger';
    return ' warning';
  }

  render() {
    const { kpiData } = this.props;
    if (kpiData.length < 1) return null;

    const daily = kpiData.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).local().hours(0), 'days') < 1));
    const previousDay = kpiData.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).local().hours(0), 'days') >= 1)
      && (moment().diff(moment.utc(m.create_date).hours(0), 'days') < 2));
    const weekly = kpiData.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).local().hours(0), 'days') < 7));
    const previousWeek = kpiData.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).local().hours(0), 'days') >= 7)
      && (moment().diff(moment.utc(m.create_date).local().hours(0), 'days') < 14));
    const monthly = kpiData.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).local().hours(0), 'days') <= 30));
    const previousMonth = kpiData.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).local().hours(0), 'days') > 30)
      && (moment().diff(moment.utc(m.create_date).local().hours(0), 'days') < 60));

    return(
      <div className="kpi-container">
        <div className="kpi-display-box info">
          <div className="kpi-header">Total</div>
          <div className="kpi-total">
          {kpiData.length}
          </div>
        </div>
        <div className={`kpi-display-box${this.getDisplayColor(daily, previousDay)}`}>
          <div className="kpi-header">Today</div>
          <div className="kpi-total">
            {daily.length}
          </div>
          <div className="kpi-last">
            {'Previous: '}
            <span>
              {previousDay.length}
            </span>
          </div>
        </div>
        <div className={`kpi-display-box${this.getDisplayColor(weekly, previousWeek)}`}>
          <div className="kpi-header">This Week</div>
          <div className="kpi-total">
            {weekly.length}
          </div>
          <div className="kpi-last">
            {'Previous: '}
            <span>
              {previousWeek.length}
            </span>
          </div>
        </div>
        <div className={`kpi-display-box${this.getDisplayColor(monthly, previousMonth)}`}>
          <div className="kpi-header">This Month</div>
          <div className="kpi-total">
            {monthly.length}
          </div>
          <div className="kpi-last">
            {'Previous: '}
            <span>
              {previousMonth.length}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

KpiData.propTypes = {
  kpiData: PropTypes.array.isRequired,
};

export default KpiData;
