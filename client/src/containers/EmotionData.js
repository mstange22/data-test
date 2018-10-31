import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import API from "../utils/API";
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import KpiData from '../components/KpiData';
import Chart from '../components/Chart';
import DisplayModeSelection from '../components/DisplayModeSelection';
import {
  clearSearch,
  setCurrentFamilyCode,
  setCurrentWatcherId,
} from '../redux/actions';

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
      displayMode: 'familyCode',
      hasInitializedData: false,
      loadingData: false,
      checked: true,
      dateRange: null,
    };
    props.clearSearch();
  }

  componentDidMount() {
    this.getEmotionData();
  }

  componentDidUpdate() {
    if (this.props.allAccounts.length && this.props.activeAccounts.length && this.state.emotionData.length && !this.state.hasInitializedData) {
      this.initializeData();
    }
  }

  initializeData = () => {
    const { allAccounts, activeAccounts } = this.props;
    const emotionData = this.state.emotionData.slice();
    emotionData.forEach(d => {
      const idx = allAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        d['Family Code'] = allAccounts[idx].read_write_share_code;
      }
    });
    console.log('watch data after adding family codes:', emotionData);
    this.setState({
      emotionData,
      activeWatcherIds: activeAccounts.reduce((acc, d) => [...acc, d.patient_account_id], []),
      activeFamilyCodes: activeAccounts.reduce((acc, d) => [...acc, d.read_write_share_code], []),
      hasInitializedData: true,
    });
  }

  getEmotionData = (range = null) => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ emotionData: [], loadingData: true });
    API.getEmotionData()
      .then(res => {
        this.props.setDisplayString('Emotion Data');
        this.setState({
          emotionData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).local().format('M/DD/YY');
              d['Total Smiles'] = d.count;
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
    if (!this.state.displayError) {
      this.setState({ displayError: true, errorMessage });
    }
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
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

  onDisplayModeChange = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ displayMode: this.state.displayMode === 'watcherId' ? 'familyCode' : 'watcherId' });
    this.props.clearSearch();
  }

  renderDashboard = () => {
    const { emotionData, checked } = this.state;
    if (emotionData.length < 1 || !this.state.hasInitializedData) return null;
    const activeUserEmotionData = emotionData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserEmotionData.length < 1) return null;
    return (
      <DataDashboard
        data={checked ? activeUserEmotionData : emotionData}
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
        clearFilterButtonDisabled={this.state.currentFamilyCode === '' && this.state.currentWatcherId === 0}
        clearFilterButtonOnClick={() => this.setState({ currentFamilyCode: '', currentWatcherId: 0})}
      />
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
    const { emotionData, displayMode, dateRange, activeFamilyCodes, activeWatcherIds, checked } = this.state;
    return (
      <div className="data-container">
        <KpiData
          kpiData={this.state.emotionData}
        />
        <DisplayModeSelection
          displayMode={this.state.displayMode}
          onDisplayModeChange={this.onDisplayModeChange}
        />
        <div id="chart-container">
          <Spinner loading={this.state.loadingData} />
          <Chart
            data={emotionData}
            chartType="watch"
            dateRange={dateRange}
            displayMode={displayMode}
            activeFamilyCodes={activeFamilyCodes}
            activeWatcherIds={activeWatcherIds}
            active={checked}
            triggerError={this.triggerError}
            rows={'Total Smiles'}
            columns={'Date'}
            color={this.state.displayMode === 'familyCode' ? 'Family Code' : 'Watcher ID'}
            title="Watchers Who Smiled By Day"
            subtitle="(see bars for number of smiles)"
          />
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

EmotionData.propTypes = {
  activeAccounts: PropTypes.array.isRequired,
  allAccounts: PropTypes.array.isRequired,
  setDisplayString: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  setCurrentWatcherId: PropTypes.func.isRequired,
  setCurrentFamilyCode: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
  currentWatcherId: state.currentWatcherId,
  currentFamilyCode: state.currentFamilyCode,
});

const mapDispatchToProps = {
  clearSearch,
  setCurrentWatcherId,
  setCurrentFamilyCode,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmotionData);
