import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import DataDashboard from '../components/DataDashboard';
import KpiData from '../components/KpiData';
import DisplayModeSelection from '../components/DisplayModeSelection';
import { clearSearch } from '../redux/actions';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 760;
const CHART_CONTAINER_WIDTH = window.innerWidth - 310;

class WatchData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchData: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
      displayError: false,
      selectedOption: 'minutesWatched',
      currentWatcherId: 0,
      currentFamilyCode: '',
      displayMode: 'familyCode',
      hasInitializedData: false,
      loadingData: false,
      checked: true,
    };
    props.clearSearch();
  }

  componentDidMount() {
    this.getWatchData();
  }

  componentDidUpdate() {
    if (this.props.allAccounts.length && this.props.activeAccounts.length && this.state.watchData.length && !this.state.hasInitializedData) {
      this.initializeData();
    }
  }

  initializeData = () => {
    const { allAccounts, activeAccounts } = this.props;
    const watchData = this.state.watchData.slice();
    watchData.forEach(d => {
      const idx = allAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        d['Family Code'] = allAccounts[idx].read_write_share_code;
      }
    });
    console.log('watch data after adding family codes:', watchData);
    this.setState({
      watchData,
      activeWatcherIds: activeAccounts.reduce((acc, d) => [...acc, d.patient_account_id], []),
      activeFamilyCodes: activeAccounts.reduce((acc, d) => [...acc, d.read_write_share_code], []),
      hasInitializedData: true,
    });
  }

  getWatchData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Watchers (Active Accounts)');
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
              d.create_date = d.date;
              return d;
            }),
            loadingData: false,
        });
      })
      .catch(err => console.log(err.message));
  }

  triggerError = (errorMessage) => {
    this.setState({ displayError: true, errorMessage });
  }

  renderWatchData = (range = null) => {
    const { watchData, displayMode } = this.state;
    if (watchData.length < 1) return null;
    let filteredWatchData = watchData.slice();

    // filter data dependent on displayMode
    if (this.state.checked) {
      if (displayMode === 'watcherId') {
        filteredWatchData = watchData.filter(d => this.state.activeWatcherIds.includes(d['Watcher ID']));
      } else {
        filteredWatchData = watchData.filter(d => this.state.activeFamilyCodes.includes(d['Family Code']));
      }
    }

    // check for watcher ID filter
    if (displayMode === 'watcherId' && this.props.currentWatcherId !== 0) {
      filteredWatchData = filteredWatchData.filter(d => d['Watcher ID'] === this.props.currentWatcherId);
    }
    // check for family code filter
    if (displayMode === 'familyCode' && this.props.currentFamilyCode !== '') {
      filteredWatchData = filteredWatchData.filter(d => d['Family Code'] === this.props.currentFamilyCode);
    }

    if (filteredWatchData.length < 1) return null;

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
      .color(displayMode === 'watcherId' ? 'Watcher ID' : 'Family Code')
      .mount('#chart-container')
    ;
  }

  handleCloseNotification = (e) => {
    e.preventDefault();
    this.setState({ displayError: false });
  }

  onWatcherSelected = (watcher, displayMode) => {
    if (displayMode === 'watcherId') {
      this.setState({ currentWatcherId: watcher, displayMode });
      this.props.setCurrentWatcherId(watcher);
    } else {
      this.setState({ currentFamilyCode: watcher, displayMode });
      this.props.setCurrentFamilyCode(watcher);
    }
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  onDisplayModeChange = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ displayMode: this.state.displayMode === 'watcherId' ? 'familyCode' : 'watcherId' });
    this.props.clearSearch('');
  }

  renderDashboard = () => {
    const { watchData, checked } = this.state;
    if (watchData.length < 1) return null;
    const activeUserWatchData = watchData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserWatchData.length < 1 || !this.state.hasInitializedData) return null;
    return (
      <DataDashboard
        data={checked ? activeUserWatchData : watchData}
        checkboxes={[{
          label: 'Only Display Active Accounts',
          name: 'activeOnly',
          checked: this.state.checked,
          onChange: (e) => {
            document.getElementById('chart-container').innerHTML = '';
            this.setState({
              checked: e.target.checked,
              currentFamilyCode: '',
              currentWatcherId: 0,
             });
             this.props.clearSearch();
          },
        }]}
        searchType="watcher"
        onSearchTargetSelected={this.onWatcherSelected}
        onDateRangePicked={range => this.renderWatchData(range)}
        clearFilterButtonDisabled={this.props.currentFamilyCode === '' && this.props.currentWatcherId === 0}
        clearFilterButtonOnClick={() => this.setState({ currentFamilyCode: '', currentWatcherId: 0})}
      />
    );
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
    return (
      <Spinner />
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
          kpiData={this.state.watchData}
        />
        <DisplayModeSelection
          displayMode={this.state.displayMode}
          onDisplayModeChange={this.onDisplayModeChange}
        />
        {/* {this.renderDisplayModeSelection()} */}
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
  clearSearch: PropTypes.func.isRequired,
  currentFamilyCode: PropTypes.string.isRequired,
  currentWatcherId: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
  currentWatcherId: state.currentWatcherId,
  currentFamilyCode: state.currentFamilyCode,
});

const mapDispatchToProps = {
  clearSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(WatchData);
