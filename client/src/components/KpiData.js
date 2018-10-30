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

  getDiff = (now, date) => {
    const createDate = moment(date).format('MM-DD-YYYY');
    const diff = moment(now, 'MM-DD-YYYY').diff(moment(createDate, 'MM-DD-YYYY'), 'days');
    return diff;
  }

  renderKpiData = () => {
    const kpiData = this.props.kpiData.filter(d => d.create_date);
    if (kpiData.length < 1) return null;

    const now = moment().format('MM-DD-YYYY');

    const daily = kpiData.filter(m => this.getDiff(now, m.create_date) < 1);
    const previousDay = kpiData.filter(m => this.getDiff(now, m.create_date) === 1);

    const weekly = kpiData.filter(m => this.getDiff(now, m.create_date) < 7);
    const previousWeek = kpiData.filter(m => this.getDiff(now, m.create_date) >= 7 && this.getDiff(now, m.create_date) < 14);

    const monthly = kpiData.filter(m => this.getDiff(now, m.create_date) < 30);
    const previousMonth = kpiData.filter(m => this.getDiff(now, m.create_date) >= 30 && this.getDiff(now, m.create_date) < 60);

    return (
      <div className="kpi-row">
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

  render() {
    return(
      <div className="kpi-container">
        {this.renderKpiData()}
      </div>
    );
  }
}

KpiData.propTypes = {
  kpiData: PropTypes.array.isRequired,
};

export default KpiData;
