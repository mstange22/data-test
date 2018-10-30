import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import KpiData from '../components/KpiData';
import { setSearchValue, setCurrentAccountId } from '../redux/actions';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 760;
const CHART_CONTAINER_WIDTH = window.innerWidth - 310;

class SmsData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      smsData: [],
      renderMode: 'Account ID',
      displayError: false,
      errorMessage: '',
      selectedOption: 'smsCount',
      loadingData: false,
    };
    props.setSearchValue('');
  }

  componentDidMount() {
    this.getSmsData();
  }

  getSmsData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Number of Incoming SMS Messages');
    this.setState({ smsData: [], loadingData: true });
    API.getSmsData()
      .then(res => {
        console.log('smsData res:', res.data);
        this.setState({
          smsData: res.data
            .slice()
            .filter(d => d.incoming === 1)
            .sort((a, b) => a.create_date < b.create_date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.create_date).format('M/DD/YY');
              d['Account ID'] = d.account_id;
              d['Messages Sent'] = d.incoming;
              return d;
            }),
          loadingData: false,
        });
      })
      .catch(err => console.log(err.message));
  }

  triggerError = (errorMessage) => {
    if (!this.state.displayError) {
      this.setState({ displayError: true, errorMessage });
    }
  }

  renderSmsData = (range = null) => {
    let filteredSmsData = this.state.smsData.slice();
    if (filteredSmsData.length < 1) {
      return null;
    }

    // check for account ID filter
    if (this.props.currentAccountId !== 0) {
      filteredSmsData = filteredSmsData.filter(d => {
        if (d['Account ID'] === this.props.currentAccountId) {
          return true;
        }
        return false;
      });
    }

    // check for date range filter
    if (range) {
      const startDate = range.startDate.format('M/DD/YY');
      const endDate = range.endDate.format('M/DD/YY');
      filteredSmsData = filteredSmsData.filter(d => {
        if (moment(d.Date, 'M/DD/YY').diff(moment(startDate, 'M/DD/YY'), 'days') >= 0 && moment(endDate, 'M/DD/YY').diff(moment(d.Date, 'M/DD/YY'), 'days') >= 0) {
          return true;
        }
        return false;
      });
    }

    // throw error if no records remain after filter
    if (filteredSmsData.length < 1) {
      this.triggerError('There are no data events over the selected date range');
      return null;
    }

    const schema = [];
    Object.keys(filteredSmsData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Messages Sent') {
        node.type = 'measure';
      }
      schema.push(node);
    });

    const dm = new DataModel(filteredSmsData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(CHART_CONTAINER_WIDTH)
      .height(CHART_CONTAINER_HEIGHT)
      .rows(['Messages Sent'])
      .columns(['Date'])
      .color('Account ID')
      .mount('#chart-container')
    ;
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  renderDashboard = () => {
    const { smsData } = this.state;
    if (smsData.length < 1) return null;
    return (
      <DataDashboard
        data={smsData}
        searchType="account"
        onSearchTargetSelected={(currentAccountId) => this.props.setCurrentAccountId(currentAccountId)}
        onDateRangePicked={range => this.renderSmsData(range)}
      />
    );
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

  render() {
    return (
      <div className="data-container">
        <KpiData
          kpiData={this.state.smsData}
        />
        <div id="chart-container">
          <Spinner loading={this.state.loadingData} />
          {this.renderSmsData()}
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

SmsData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  currentAccountId: PropTypes.number.isRequired,
  setCurrentAccountId: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentAccountId: state.currentAccountId,
});

const mapDispatchToProps = {
  setSearchValue,
  setCurrentAccountId,
};

export default connect(mapStateToProps, mapDispatchToProps)(SmsData);
