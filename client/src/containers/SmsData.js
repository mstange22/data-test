import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import { setState } from '../redux/actions';

const env = muze();
const CHART_CONTAINER_HEIGHT = 480;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

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
      selectedOption: 'smsCount',
      loadingSmsData: false,
    };
  }

  componentDidMount() {
    this.getSmsData();
  }

  getSmsData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Number of Incoming SMS Messages');
    this.setState({ smsData: [], loadingSmsData: true });
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
          loadingSmsData: false,
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveSmsAccounts()
    .then(res => {
      console.log('active sms accounts res:', res.data);
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
    const activeUserSmsData = smsData
      .slice()
      .filter(d => this.state.activeSmsAccountIds.includes(d['Account ID']));
    if (activeUserSmsData.length < 1) return null;
    return (
      <DataDashboard
        data={activeUserSmsData}
        checkboxes={[{
          label: 'SMS Count',
          name: 'smsCount',
          checked: this.state.selectedOption === 'smsCount',
          onChange: (e) => {
            e.preventDefault();
            const { name } = e.target;
            this.setState({ selectedOption: name });
          },
        }]}
        searchType="account"
        onSearchTargetSelected={(currentAccountId) => this.setState({ currentAccountId })}
        onDateRangePicked={range => this.renderSmsData(range)}
        clearFilterButtonDisabled={this.state.currentAccountId === 0}
        clearFilterButtonOnClick={() => this.setState({ currentAccountId: 0})}
      />
    );
  }

  renderSpinner = () => {
    if (!this.state.loadingSmsData) return null;
    return (
      <Spinner height={CHART_CONTAINER_HEIGHT} width={CHART_CONTAINER_WIDTH} />
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
          {this.renderSpinner()}
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
