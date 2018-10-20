import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import DateRangePicker from '../components/DateRangePicker';
// import WatcherIdSelector from '../components/WatcherIdSelector';
import WatcherSearch from '../components/WatcherSearch';

const env = muze();

class EmotionData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emotionData: [],
      activeWatcherAccounts: [],
      activeWatcherIds: [],
      displayError: false,
      selectedOption: 'smileCount',
      currentWatcherId: 0,
    };
    this.hasAddedFamilyCodes = false;
  }

  componentDidMount() {
    this.getEmotionData();
  }

  componentDidUpdate() {
    if (this.state.activeWatcherAccounts.length && this.state.emotionData.length && !this.hasAddedFamilyCodes) {
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
    this.setState({ emotionData });
    this.hasAddedFamilyCodes = true;
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
              return d;
            }),
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveAccounts()
    .then(res => {
      console.log('active customer accounts:', res.data);
      this.setState({
        activeWatcherAccounts: res.data,
        activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
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
    if (emotionData.length < 1) return null;
    let filteredEmotionData = emotionData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id));

    // check for watcher ID filter
    if (this.state.currentWatcherId !== 0) {
      filteredEmotionData = filteredEmotionData.filter(d => {
        if (d.watcher_id === this.state.currentWatcherId) {
          return true;
        }
        return false;
      });
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
      .height(480)
      .rows(['Total Smiles'])
      .columns(['Date'])
      .color(true ? 'watcher_id' : 'Famil Code')
      .mount('#chart-container')
    ;
  }

  handleCloseNotification = (e) => {
    e.preventDefault();
    this.setState({ displayError: false });
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
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
          <WatcherSearch
            activeUserData={activeUserEmotionData}
            activeWatcherAccounts={this.state.activeWatcherAccounts}
            onWatcherIdSelected={(currentWatcherId) => this.setState({ currentWatcherId })}
          />
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
      <div className="notification-container">
        <h2>Error!</h2>
        { this.state.errorMessage }
        <br />
        <br />
        <form>
          <Button
            bsStyle="default"
            bsSize="large"
            onClick={this.handleCloseNotification}
            type="submit"
          >
            OK
          </Button>
        </form>

      </div>
    )
  }

  render() {
    // console.log('emotion state:', this.state);
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
