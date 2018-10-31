import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import API from "../utils/API";
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import DataDashboard from '../components/DataDashboard';
import KpiData from '../components/KpiData';
import DisplayModeSelection from '../components/DisplayModeSelection';
import Chart from '../components/Chart';
import { clearSearch, setCurrentFamilyCode, setCurrentWatcherId } from '../redux/actions';

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
      dateRange: null,
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

  handleCloseNotification = (e) => {
    e.preventDefault();
    this.setState({ displayError: false });
  }

  onWatcherSelected = (watcher, displayMode) => {
    this.setState({ displayMode });
    if (displayMode === 'watcherId') {
      this.props.setCurrentWatcherId(watcher);
      this.props.setCurrentFamilyCode('');
    } else {
      this.props.setCurrentFamilyCode(watcher);
      this.props.setCurrentWatcherId(0);
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
    if (watchData.length < 1 || !this.state.hasInitializedData) return null;
    const activeUserWatchData = watchData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserWatchData.length < 1) return null;
    return (
      <DataDashboard
        data={checked ? activeUserWatchData : watchData}
        checkboxes={[{
          label: 'Only Display Active Accounts',
          name: 'activeOnly',
          checked: this.state.checked,
          onChange: (e) => {
            document.getElementById('chart-container').innerHTML = '';
            this.setState({ checked: e.target.checked });
             this.props.clearSearch();
          },
        }]}
        searchType="watcher"
        onSearchTargetSelected={this.onWatcherSelected}
        onDateRangePicked={dateRange => this.setState({ dateRange })}
        clearFilterButtonDisabled={this.props.currentFamilyCode === '' && this.props.currentWatcherId === 0}
        clearFilterButtonOnClick={() => this.setState({ currentFamilyCode: '', currentWatcherId: 0})}
      />
    );
  }

  renderSpinner = () => {
    // if (!this.state.loadingData) return null;
    return (
      <Spinner loading={this.state.loadingData} />
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
    const { watchData, displayMode, dateRange, activeFamilyCodes, activeWatcherIds, checked } = this.state;
    return (
      <div className="data-container">
        <KpiData
          kpiData={watchData}
        />
        <DisplayModeSelection
          displayMode={displayMode}
          onDisplayModeChange={this.onDisplayModeChange}
        />
        <div id="chart-container">
          {this.renderSpinner()}
          {/* <Spinner loading={this.state.loadingData} /> */}
          <Chart
            data={watchData}
            chartType="watch"
            dateRange={dateRange}
            displayMode={displayMode}
            activeFamilyCodes={activeFamilyCodes}
            activeWatcherIds={activeWatcherIds}
            active={checked}
            triggerError={this.triggerError}
            rows={'Total Watch Minutes'}
            columns={'Date'}
            color={this.state.displayMode === 'familyCode' ? 'Family Code' : 'Watcher ID'}
            title="Watch Minutes By Day"
            subtitle="(see bars for minutes per watcher)"
          />
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

WatchData.propTypes = {
  activeAccounts: PropTypes.array.isRequired,
  allAccounts: PropTypes.array.isRequired,
  setDisplayString: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  currentFamilyCode: PropTypes.string.isRequired,
  currentWatcherId: PropTypes.number.isRequired,
  setCurrentFamilyCode: PropTypes.func.isRequired,
  setCurrentWatcherId: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
  currentWatcherId: state.currentWatcherId,
  currentFamilyCode: state.currentFamilyCode,
});

const mapDispatchToProps = {
  clearSearch,
  setCurrentFamilyCode,
  setCurrentWatcherId,
};

export default connect(mapStateToProps, mapDispatchToProps)(WatchData);
