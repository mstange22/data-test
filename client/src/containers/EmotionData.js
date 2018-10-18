import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import DateRangePicker from '../components/DateRangePicker';

const env = muze();

class EmotionData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emotionData: [],
      activeWatcherIds: [],
      displayError: false,
    };
  }

  componentDidMount() {
    this.getEmotionData();
  }

  getEmotionData = (range = null) => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ emotionData: [] });
    API.getEmotionData()
      .then(res => {
        this.setState({
          emotionData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Total Smiles'] = d.count;
              return d;
            }),
        }, () => {
          console.log('emotionData res:', this.state.emotionData);
          this.props.setDisplayString('Number of Smiles by Day (Active Accounts)');
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveAccounts()
    .then(res => {
      // console.log('active customer accounts:', res.data);
      this.setState({
        customerAccounts: res.data,
        activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
      }, () => {
        // console.log('active watcher IDs:', this.state.activeWatcherIds);
      });
    })
    .catch(err => console.log(err.message));
  }

  triggerError = (errorMessage) => {
    this.setState({ displayError: true, errorMessage });
  }

  renderEmotionData = (range = null) => {
    const { emotionData } = this.state;
    if (emotionData.length < 1) return null;
    let filteredEmotionData = emotionData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
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
      this.triggerError('There are no data events over that date range');
      return null;
    }
    const schema = [];
    Object.keys(filteredEmotionData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Total Smiles') {
        node.type = 'measure';
      }
      schema.push(node);
    });
    const dm = new DataModel(filteredEmotionData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth - 280)
      .height(480)
      .rows(['Total Smiles'])
      .columns(['Date'])
      .color('watcher_id')
      .mount('#chart-container')
    ;
  }

  handleCloseNotification = (e) => {
    e.preventDefault();
    this.setState({ displayError: false });
  }

  renderDashboard = () => {
    const { emotionData } = this.state;
    if (this.state.emotionData.length < 1) return null;
    const activeUserEmotionData = emotionData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id))
    console.log('data:', activeUserEmotionData);
    return (
      <DateRangePicker
        onDateRangePicked={(range) => this.renderEmotionData(range)}
        minDate={moment(activeUserEmotionData[0].Date, 'M/DD/YY')}
        maxDate={moment(activeUserEmotionData[activeUserEmotionData.length - 1].Date, 'M/DD/YY')}
      />
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
