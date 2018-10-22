import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';
import DateRangePicker from '../components/DateRangePicker';
import Notification from '../components/Notification';
import AccountIdSearch from '../components/AccountIdSearch';
import { setState } from '../redux/actions';
const env = muze();

class SmsData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      smsData: [],
      renderMode: 'Account ID',
      activeSmsAccounts: [],
      activeSmsAccountIds: [],
      displayError: false,
      errorMessage: '',
      currentAccountId: 0,
    };
  }

  componentDidMount() {
    this.getSmsData();
    this.props.setState({ greeting: 'now in SMS Data'});
  }

  componentDidUpdate(prevProps) {
    if (this.props.state !== prevProps.state) {
      console.log('newState:', this.props.state);
    }
  }

  getSmsData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ smsData: [] });
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
          }, () => {
            // console.log('smsData:', this.state.smsData);
            this.props.setDisplayString('Number of Incoming SMS Messages');
          });
      })
      .catch(err => console.log(err.message));
    API.getActiveSmsAccounts()
    .then(res => {
      console.log('active sms accounts:', res.data);
      this.setState({
        activeSmsAccounts: res.data,
        activeSmsAccountIds: res.data.reduce((acc, d) => [...acc, d.account_id], []),
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
    if (this.state.currentAccountId !== 0) {
      filteredSmsData = filteredSmsData.filter(d => {
        if (d['Account ID'] === this.state.currentAccountId) {
          // console.log('**** match ****');
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

    // console.log('schema:', schema);
    const dm = new DataModel(filteredSmsData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth - 280)
      .height(480)
      .rows(['Messages Sent'])
      .columns(['Date'])
      .color('Account ID')
      .mount('#chart-container')
    ;
  }

  renderDashboard = () => {
    const { smsData } = this.state;
    if (smsData.length < 1) return null;
    const activeUserSmsData = smsData
      .slice()
      .filter(d => this.state.activeSmsAccountIds.includes(d['Account ID']));
    if (activeUserSmsData.length < 1) return null;
    return (
      <div className="data-dashboard">
        <div className="form-input-container">
          <label>
            <input
              name="smsCount"
              type="checkbox"
              checked={this.state.selectedOption === 'smsCount'}
              onChange={this.handleInputChange}
            />
            {' SMS Count'}
          </label>
          <AccountIdSearch
            activeUserData={activeUserSmsData}
            activeAccountIds={this.state.activeSmsAccountIds}
            onAccountIdSelected={(currentAccountId) => this.setState({ currentAccountId })}
          />
        </div>
        <DateRangePicker
          onDateRangePicked={(range) => this.renderSmsData(range)}
          minDate={moment(activeUserSmsData[0].Date, 'M/DD/YY')}
          maxDate={moment(activeUserSmsData[activeUserSmsData.length - 1].Date, 'M/DD/YY')}
        />
      </div>
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
    )
  }

  render() {
    return (
      <div className="data-dashboard">
        <div id="chart-container">
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
}

const mapStateToProps = (state) => ({
  state,
});

const mapDispatchToProps = {
  setState,
};

export default connect(mapStateToProps, mapDispatchToProps)(SmsData);
