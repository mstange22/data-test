import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import DataDashboard from '../components/DataDashboard';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

class WatchData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchData: [],
      activeWatcherAccounts: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
      displayError: false,
      selectedOption: 'minutesWatched',
      currentWatcherId: 0,
      currentFamilyCode: '',
      renderMode: 'familyCode',
      hasAddedFamilyCodes: false,
      loadingData: false,
    };
  }

  componentDidMount() {
    this.getWatchData();
  }

  componentDidUpdate() {
    if (this.state.activeWatcherAccounts.length && this.state.watchData.length && !this.state.hasAddedFamilyCodes) {
      this.addFamilyCodesToWatchData();
    }
  }

  addFamilyCodesToWatchData = () => {
    const { activeWatcherAccounts } = this.state;
    const watchData = this.state.watchData.slice();
    watchData.forEach(d => {
      const idx = activeWatcherAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        d['Family Code'] = activeWatcherAccounts[idx].read_write_share_code;
      }
    });
    console.log('watch data after adding family codes:', watchData);
    this.setState({ watchData, hasAddedFamilyCodes: true });
  }

  getWatchData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Minutes Watched by Day (Active Accounts)');
    this.setState({ watchData: [], loadingData: true });
    API.getWatchData()
      .then(res => {
        this.setState({
          watchData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Total Watch Minutes'] = (d.sum_watch / 1000 / 60).toFixed();
              d['Watcher ID'] = d.watcher_id;
              return d;
            }),
            loadingData: false,
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveWatcherAccounts()
      .then(res => {
        console.log('active watcher accounts res:', res.data);
        this.setState({
          activeWatcherAccounts: res.data,
          activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
          activeFamilyCodes: res.data.reduce((acc, d) => [...acc, d.read_write_share_code], []),
        });
      })
      .catch(err => console.log(err.message));
  }

  triggerError = (errorMessage) => {
    this.setState({ displayError: true, errorMessage });
  }

  renderWatchData = (range = null) => {
    const { watchData, renderMode } = this.state;
    if (watchData.length < 1) return null;
    let filteredWatchData = [];

    // filter data dependent on renderMode
    if (renderMode === 'watcherId') {
      filteredWatchData = watchData.filter(d => this.state.activeWatcherIds.includes(d['Watcher ID']));
    } else {
      filteredWatchData = watchData.filter(d => this.state.activeFamilyCodes.includes(d['Family Code']));
    }
    if (filteredWatchData.length < 1) return null;
    // check for watcher ID filter
    if (renderMode === 'watcherId' && this.state.currentWatcherId !== 0) {
      filteredWatchData = filteredWatchData.filter(d => d['Watcher ID'] === this.state.currentWatcherId);
    }
    // check for family code filter
    if (renderMode === 'familyCode' && this.state.currentFamilyCode !== '') {
      filteredWatchData = filteredWatchData.filter(d => d['Family Code'] === this.state.currentFamilyCode);
    }

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
      }
      schema.push(node);
    });
    const dm = new DataModel(filteredWatchData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(CHART_CONTAINER_WIDTH)
      .height(CHART_CONTAINER_HEIGHT)
      .rows(['Total Watch Minutes'])
      .columns(['Date'])
      .color(renderMode === 'watcherId' ? 'Watcher ID' : 'Family Code')
      .mount('#chart-container')
    ;
  }

  handleCloseNotification = (e) => {
    e.preventDefault();
    this.setState({ displayError: false });
  }

  onWatcherSelected = (watcher, renderMode) => {
    if (renderMode === 'watcherId') {
      this.setState({ currentWatcherId: watcher, renderMode });
    } else {
      this.setState({ currentFamilyCode: watcher, renderMode });
    }
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  renderDashboard = () => {
    const { watchData } = this.state;
    if (this.state.watchData.length < 1) return null;
    const activeUserWatchData = watchData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserWatchData.length < 1 || !this.state.hasAddedFamilyCodes) return null;
    return (
      <DataDashboard
        data={activeUserWatchData}
        checkboxes={[{
          label: 'Minutes Watched',
          name: 'minutesWatched',
          checked: this.state.selectedOption === 'minutesWatched',
          onChange: (e) => {
            e.preventDefault();
            const { name } = e.target;
            this.setState({ selectedOption: name });
          },
        }]}
        searchType="watcher"
        onSearchTargetSelected={this.onWatcherSelected}
        onDateRangePicked={range => this.renderWatchData(range)}
        clearFilterButtonDisabled={this.state.currentFamilyCode === '' && this.state.currentWatcherId === 0}
        clearFilterButtonOnClick={() => this.setState({ currentFamilyCode: '', currentWatcherId: 0})}
      />
    );
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
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
    );
  }

  render() {
    return (
      <div className="data-container">
        <div id="chart-container">
          {this.renderSpinner()}
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
};

export default WatchData;
