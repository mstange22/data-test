import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import DateRangePicker from '../components/DateRangePicker';

const env = muze();

class WatchData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchData: [],
      activeWatcherIds: [],
      displayError: false,
    };
  }

  componentDidMount() {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ watchData: [] });
    API.getWatchData()
      .then(res => {
        this.setState({
          watchData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Total Watch Minutes'] = (d.sum_watch / 1000 / 60).toFixed();
              return d;
            }),
          displayString: 'Minutes Watched by Day (Active Accounts)',
        }, () => {
          console.log('cleaned watchData:', this.state.watchData);
          this.props.setDisplayString('Minutes Watched by Day (Active Accounts)');
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

  renderWatchData = (range = null) => {
    const { watchData } = this.state;
    if (watchData.length < 1) return null;
    let filteredWatchData = watchData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (range) {
      const startDate = range.startDate.format('M/DD/YY');
      const endDate = range.endDate.format('M/DD/YY');
      filteredWatchData = filteredWatchData.filter(d => {
        if (moment(d.Date, 'M/DD/YY').diff(moment(startDate, 'M/DD/YY'), 'days') >= 0 && moment(endDate, 'M/DD/YY').diff(moment(d.Date, 'M/DD/YY'), 'days') >= 0) {
          return true;
        }
        return false;
      });
    }
    if (filteredWatchData.length < 1) {
      this.triggerError('There are no data events over that date range');
      return null;
    }
    const schema = [];
    Object.keys(filteredWatchData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Total Watch Minutes') {
        node.type = 'measure';
      // } else if (key === 'date') {
      //   node.subtype = 'temporal';
      }
      schema.push(node);
    });
    const dm = new DataModel(filteredWatchData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth - 280)
      .height(480)
      .rows(['Total Watch Minutes'])
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
    const { watchData } = this.state;
    if (this.state.watchData.length < 1) return null;
    const activeUserWatchData = watchData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id))
    console.log('data:', activeUserWatchData);
    if (activeUserWatchData.length < 1) return null;
    return (
      <DateRangePicker
        onDateRangePicked={(range) => this.renderWatchData(range)}
        minDate={moment(activeUserWatchData[0].Date, 'M/DD/YY')}
        maxDate={moment(activeUserWatchData[activeUserWatchData.length - 1].Date, 'M/DD/YY')}
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
          {this.renderWatchData()}
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

WatchData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default WatchData;
