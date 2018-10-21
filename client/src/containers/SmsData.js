import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';

const env = muze();

class SmsData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      smsData: [],
      renderMode: 'Account ID',
      activeWatcherAccounts: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
    };
  }

  componentDidMount() {
    this.getSmsData();
  }

  componentDidUpdate() {
    if (this.state.activeWatcherAccounts.length && this.state.smsData.length && !this.state.hasAddedFamilyCodes) {
      this.addFamilyCodesToEmotionData();
    }
  }

  addFamilyCodesToEmotionData = () => {
    const { activeWatcherAccounts } = this.state;
    const smsData = this.state.smsData.slice();
    smsData.forEach(d => {
      const idx = activeWatcherAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        d['Family Code'] = activeWatcherAccounts[idx].read_write_share_code;
      }
    });
    console.log('smsData:', smsData);
    this.setState({ smsData, hasAddedFamilyCodes: true });
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
            this.props.setDisplayString('Number of SMS Messages (Active Accounts)');
          });
      })
      .catch(err => console.log(err.message));
    API.getActiveAccounts()
    .then(res => {
      console.log('active customer accounts:', res.data);
      this.setState({
        activeWatcherAccounts: res.data,
        activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
        activeFamilyCodes: res.data.reduce((acc, d) => [...acc, d.read_write_share_code], []),
      });
    })
    .catch(err => console.log(err.message));
  }

  renderSmsData = () => {
    const { smsData } = this.state;
    if (smsData.length < 1) {
      return null;
    }

    const schema = [];
    Object.keys(smsData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Messages Sent') {
        node.type = 'measure';
      }
      schema.push(node);
    });

    // console.log('schema:', schema);
    const dm = new DataModel(smsData, schema);
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

  render() {
    return (
      <div id="chart-container">
        {this.renderSmsData()}
      </div>
    );
  }
}

SmsData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default SmsData;
