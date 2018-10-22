import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Button } from 'react-bootstrap';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import DateRangePicker from '../components/DateRangePicker';
import WatcherSearch from '../components/WatcherSearch';
import Notification from '../components/Notification';

const env = muze();

class EmotionData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emotionData: [],
      activeWatcherAccounts: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
      displayError: false,
      selectedOption: 'smileCount',
      currentWatcherId: 0,
      currentFamilyCode: '',
      renderMode: 'familyCode',
      hasAddedFamilyCodes: false,
    };
  }

  componentDidMount() {
    this.getEmotionData();
  }

  componentDidUpdate() {
    if (this.state.activeWatcherAccounts.length && this.state.emotionData.length && !this.state.hasAddedFamilyCodes) {
      this.addFamilyCodesToEmotionData();
    }
  }

  addFamilyCodesToEmotionData = () => {
    const { activeWatcherAccounts } = this.state;
    const emotionData = this.state.emotionData.slice();
    emotionData.forEach(d => {
      const idx = activeWatcherAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        d['Family Code'] = activeWatcherAccounts[idx].read_write_share_code;
      }
    });
    console.log('emotion data:', emotionData);
    this.setState({ emotionData, hasAddedFamilyCodes: true });
  }

  getEmotionData = (range = null) => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ emotionData: [] });
    API.getEmotionData()
      .then(res => {
        this.props.setDisplayString('Number of Smiles by Day (Active Accounts)');
        this.setState({
          emotionData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Total Smiles'] = d.count;
              d['Watcher ID'] = d.watcher_id;
              return d;
            }),
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveWatcherAccounts()
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

  triggerError = (errorMessage) => {
    if (!this.state.displayError) {
      this.setState({ displayError: true, errorMessage });
    }
  }

  renderEmotionData = (range = null) => {
    const { emotionData } = this.state;
    const { renderMode } = this.state;
    let filteredEmotionData = [];

    if (emotionData.length < 1) return null;
    if (renderMode === 'watcherId') {
      filteredEmotionData = emotionData.filter(d => this.state.activeWatcherIds.includes(d['Watcher ID']));
    } else {
      filteredEmotionData = emotionData.filter(d => this.state.activeFamilyCodes.includes(d['Family Code']));
    }
    // console.log('filtered emotion data:', filteredEmotionData);
    if (filteredEmotionData.length < 1) return null;

    // check for watcher ID filter
    if (renderMode === 'watcherId' && this.state.currentWatcherId !== 0) {
      filteredEmotionData = filteredEmotionData.filter(d => {
        if (d['Watcher ID'] === this.state.currentWatcherId) {
          return true;
        }
        return false;
      });
    }

    // check for family code filter
    if (renderMode === 'familyCode' && this.state.currentFamilyCode !== '') {
      console.log('watcher:', this.state.currentFamilyCode);
      filteredEmotionData = filteredEmotionData.filter(d => d['Family Code'] === this.state.currentFamilyCode);
    }

    // check for date range filter
    if (range) {
      const startDate = range.startDate.format('M/DD/YY');
      const endDate = range.endDate.format('M/DD/YY');
      filteredEmotionData = filteredEmotionData.filter(d => {
        if (moment(d.Date, 'M/DD/YY').diff(moment(startDate, 'M/DD/YY'), 'days') >= 0 && moment(endDate, 'M/DD/YY').diff(moment(d.Date, 'M/DD/YY'), 'days') >= 0) {
          return true;
        }
        return false;
      });
    }

    // throw error if no records remain after filter
    if (filteredEmotionData.length < 1) {
      this.triggerError('There are no data events over the selected date range');
      return null;
    }

    const schema = [];
    Object.keys(filteredEmotionData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Total Smiles' || key === 'Average Smile Strength') {
        node.type = 'measure';
      }
      schema.push(node);
    });

    const dm = new DataModel(filteredEmotionData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth - 300)
      .height(window.innerHeight - 580)
      .rows(['Total Smiles'])
      .columns(['Date'])
      .color(renderMode === 'watcherId' ? 'Watcher ID' : 'Family Code')
      .mount('#chart-container')
    ;
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  handleWatcherSelected = (watcher, renderMode) => {
    if (renderMode === 'watcherId') {
      this.setState({ currentWatcherId: watcher, renderMode });
    } else {
      this.setState({ currentFamilyCode: watcher, renderMode });
    }
  }

  renderDashboard = () => {
    const { emotionData } = this.state;
    if (this.state.emotionData.length < 1) return null;
    const activeUserEmotionData = emotionData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserEmotionData.length < 1) return null;
    return (
      <div className="data-dashboard">
        <div className="form-input-container">
          <label>
            <input
              name="smileCount"
              type="checkbox"
              checked={this.state.selectedOption === 'smileCount'}
              onChange={this.handleInputChange}
            />
            {' Smile Count'}
          </label>
          {this.state.hasAddedFamilyCodes && (
            <WatcherSearch
              activeUserData={activeUserEmotionData}
              activeWatcherAccounts={this.state.activeWatcherAccounts}
              onWatcherIdSelected={this.handleWatcherSelected}
            />
          )}
        </div>
        <DateRangePicker
          onDateRangePicked={(range) => this.renderEmotionData(range)}
          minDate={moment(activeUserEmotionData[0].Date, 'M/DD/YY')}
          maxDate={moment(activeUserEmotionData[activeUserEmotionData.length - 1].Date, 'M/DD/YY')}
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
      <div className="emotion-dashboard">
        <div id="chart-container">
          {this.renderEmotionData()}
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

EmotionData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default EmotionData;
