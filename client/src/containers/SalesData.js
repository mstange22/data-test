import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import API from "../utils/API";
import Spinner from '../components/Spinner';
import KpiData from '../components/KpiData';
import Chart from '../components/Chart';
import Notification from '../components/Notification';

class SalesData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      salesData: [],
      totalSalesData: [],
      loadingData: false,
      hasCalculatedDailySalesTotal: false,
    };
  }

  componentDidMount() {
    this.props.setDisplayString('Sales Data');
    this.setState({ loadingData: true });
    API.getSalesData()
      .then(res => {
          console.log('salesData:', res.data);
          this.setState({
            salesData: res.data
              .slice()
              .sort((a, b) => a.create_date < b.create_date ? -1 : 1)
              .map(d => {
                d['Date'] = moment.utc(d.create_date).format('M/DD/YY');
                d['Sales'] = 1;
                return d;
              }),
            loadingData: false,
          });
      })
      .catch(err => console.log(err.message));
  }

  componentDidUpdate() {
    if (this.state.salesData.length > 1 && !this.state.hasCalculatedDailySalesTotal) {
      let totalSalesData = [];
      let cumulativeSales = 0;
      const dailySales = this.state.salesData
        .reduce((accum, d) => {
          if (accum[d['Date']]) accum[d['Date']]++;
          else accum[d['Date']] = 1;
          return accum;
        }, {});
      Object.keys(dailySales).forEach(key => {
        totalSalesData.push({
          Date: key,
          'Total Sales': dailySales[key] + cumulativeSales,
        });
        cumulativeSales += dailySales[key];
      });
      this.setState({ totalSalesData, hasCalculatedDailySalesTotal: true });
    }
  }

  triggerError = (errorMessage) => {
    document.getElementById('chart-container').innerHTML = '';
    if (!this.state.displayError) {
      this.setState({ displayError: true, errorMessage });
    }
  }

  renderNotification = () => {
    if (!this.state.displayError) {
      return null;
    }
    return (
      <Notification
        errorMessage={this.state.errorMessage}
        onCloseNotification={() => this.setState({ displayError: false })}
      />
    );
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
    return (
      <Spinner />
    );
  }

  renderChart = () => {
    if (this.state.totalSalesData.length < 1) return null;
    return (
      <Chart
        data={this.state.totalSalesData}
        chartType="sales"
        displayMode={null}
        rows={'Total Sales'}
        columns={'Date'}
        triggerError={this.triggerError}
      />
    );
  }

  render() {
    return (
      <div className="data-container">
          <KpiData
            kpiData={this.state.salesData}
          />
          <div id="chart-container">
            {this.renderSpinner()}
            {this.renderChart()}
          </div>
          {this.renderNotification()}
      </div>
    );
  }
}

SalesData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesData);
