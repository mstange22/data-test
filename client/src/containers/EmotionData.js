import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';

const env = muze();
const CHART_CONTAINER_HEIGHT = 480;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

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
      loadingData: false,
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
    // console.log('emotion data:', emotionData);
    this.setState({ emotionData, hasAddedFamilyCodes: true });
  }

  getEmotionData = (range = null) => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ emotionData: [], loadingData: true });
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
            loadingData: false,
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
    const { emotionData, renderMode } = this.state;
    if (emotionData.length < 1) return null;
    let filteredEmotionData = [];

    // filter data dependent on renderMode
    if (renderMode === 'watcherId') {
      filteredEmotionData = emotionData.filter(d => this.state.activeWatcherIds.includes(d['Watcher ID']));
    } else {
      filteredEmotionData = emotionData.filter(d => this.state.activeFamilyCodes.includes(d['Family Code']));
    }
    // console.log('filtered emotion data:', filteredEmotionData);
    if (filteredEmotionData.length < 1) return null;
    // check for watcher ID filter
    if (renderMode === 'watcherId' && this.state.currentWatcherId !== 0) {
      filteredEmotionData = filteredEmotionData.filter(d => d['Watcher ID'] === this.state.currentWatcherId);
    }
    // check for family code filter
    if (renderMode === 'familyCode' && this.state.currentFamilyCode !== '') {
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

  onWatcherSelected = (watcher, renderMode) => {
    if (renderMode === 'watcherId') {
      this.setState({ currentWatcherId: watcher, currentFamilyCode: '', renderMode });
    } else {
      this.setState({ currentFamilyCode: watcher, currentWatcherId: 0, renderMode });
    }
  }

  renderDashboard = () => {
    const { emotionData } = this.state;
    if (this.state.emotionData.length < 1 || !this.state.hasAddedFamilyCodes) return null;
    const activeUserEmotionData = emotionData
      .slice()
      .filter(d => this.state.activeWatcherIds.includes(d.watcher_id));
    if (activeUserEmotionData.length < 1) return null;
    return (
      <DataDashboard
        data={activeUserEmotionData}
        activeUserData={this.state.activeWatcherAccounts}
        checkboxes={[{
          label: 'Smile Count',
          name: 'smileCount',
          checked: this.state.selectedOption === 'smileCount',
          onChange: (e) => {
            e.preventDefault();
            const { name } = e.target;
            this.setState({ selectedOption: name });
          },
        }]}
        searchType="watcher"
        onSearchTargetSelected={this.onWatcherSelected}
        onDateRangePicked={range => this.renderEmotionData(range)}
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
    )
  }

  render() {
    console.log('currentFamilyCode:', this.state.currentFamilyCode);
    return (
      <div className="emotion-dashboard">
        <div id="chart-container">
          {this.renderSpinner()}
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
