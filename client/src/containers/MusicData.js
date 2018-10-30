import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import moment from 'moment';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import KpiData from '../components/KpiData';
import Chart from '../components/Chart';
import { clearSearch, setCurrentFamilyCode, setCurrentWatcherId } from '../redux/actions';

class MusicData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      musicData: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
      displayError: false,
      errorMessage: '',
      renderMode: 'familyCode',
      selectedOption: 'musicData',
      hasInitializedData: false,
      loadingData: false,
      checked: true,
    };
    props.clearSearch();
  }

  componentDidMount() {
    this.getMusicData();
  }

  componentDidUpdate() {
    if (this.props.allAccounts.length && this.props.activeAccounts.length && this.state.musicData.length && !this.state.hasInitializedData) {
      this.initializeData();
    }
  }

  initializeData = () => {
    const { allAccounts, activeAccounts } = this.props;
    const musicData = this.state.musicData.slice();
    musicData.forEach(d => {
      const idx = allAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        d['Family Code'] = allAccounts[idx].read_write_share_code;
      }
    });
    console.log('music data after adding family codes:', musicData);
    this.setState({
      musicData,
      activeWatcherIds: activeAccounts.reduce((acc, d) => [...acc, d.patient_account_id], []),
      activeFamilyCodes: activeAccounts.reduce((acc, d) => [...acc, d.read_write_share_code], []),
      hasInitializedData: true,
    });
  }

  getMusicData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Songs Played');
    this.setState({ musicData: [], loadingData: true });
    API.getMusicData()
      .then(res => {
        this.setState({
          musicData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Watcher ID'] = d.watcher_id;
              d['Songs Played'] = 1;
              d.create_date = d.date;
              return d;
            }),
            loadingData: false,
        }, () => {
          console.log('sorted musicData:', this.state.musicData);
        });
      })
      .catch(err => console.log(err.message));
  }

  triggerError = (errorMessage) => {
    document.getElementById('chart-container').innerHTML = '';
    if (!this.state.displayError) {
      this.setState({ displayError: true, errorMessage });
    }
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  onWatcherSelected = (watcher, renderMode) => {
    this.setState({ renderMode });
    if (renderMode === 'watcherId') {
      this.props.setCurrentWatcherId(watcher);
      this.props.setCurrentFamilyCode('');
    } else {
      this.props.setCurrentWatcherId(0);
      this.props.setCurrentFamilyCode(watcher);
    }
  }

  renderDashboard = () => {
    const { musicData, checked } = this.state;
    if (musicData.length < 1 || !this.state.hasInitializedData) return null;
    const activeUserMusicData = musicData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserMusicData.length < 1) return null;
    return (
      <DataDashboard
        data={checked ? activeUserMusicData : musicData}
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
        onDateRangePicked={range => this.renderMusicData(range)}
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
    const { musicData, displayMode, dateRange, activeFamilyCodes, activeWatcherIds, checked } = this.state;
    return (
      <div className="data-container">
        <KpiData
          kpiData={this.state.musicData}
        />
        <div id="chart-container">
          <Spinner loading={this.state.loadingData} />
          <Chart
            data={musicData}
            chartType="watch"
            dateRange={dateRange}
            displayMode={displayMode}
            activeFamilyCodes={activeFamilyCodes}
            activeWatcherIds={activeWatcherIds}
            active={checked}
            triggerError={this.triggerError}
            rows={'Songs Played'}
            columns={'Date'}
            color={this.state.displayMode === 'familyCode' ? 'Family Code' : 'Watcher ID'}
          />
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

MusicData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  allAccounts: PropTypes.array.isRequired,
  activeAccounts: PropTypes.array.isRequired,
  setCurrentFamilyCode: PropTypes.func.isRequired,
  setCurrentWatcherId: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
});

const mapDispatchToProps = {
  clearSearch,
  setCurrentFamilyCode,
  setCurrentWatcherId,
};

export default connect(mapStateToProps, mapDispatchToProps)(MusicData);
