import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

class MusicData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      musicData: [],
      activeWatcherAccounts: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
      displayError: false,
      errorMessage: '',
      currentWatcherId: 0,
      currentFamilyCode: '',
      renderMode: 'familyCode',
      selectedOption: 'musicData',
      hasAddedFamilyCodes: false,
      loadingData: false,
    };
  }

  componentDidMount() {
    this.getMusicData();
  }

  componentDidUpdate() {
    if (this.state.activeWatcherAccounts.length && this.state.musicData.length && !this.state.hasAddedFamilyCodes) {
      this.addFamilyCodesToData();
    }
  }

  addFamilyCodesToData = () => {
    const { activeWatcherAccounts } = this.state;
    const musicData = this.state.musicData.slice();
    musicData.forEach(d => {
      const idx = activeWatcherAccounts.findIndex(account => account.patient_account_id === d.watcher_id);
      if (idx !== -1) {
        // console.log('musicData index:', idx, 'family code:', activeWatcherAccounts[idx].read_write_share_code);
        // console.log('**** match ****');
        d['Family Code'] = activeWatcherAccounts[idx].read_write_share_code;
      }
    });
    console.log('music data after adding family codes:', musicData);
    this.setState({ musicData, hasAddedFamilyCodes: true });
  }

  getMusicData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Music Data');
    this.setState({ musicData: [], loadingData: true });
    API.getMusicData()
      .then(res => {
        console.log('music res:', res.data);
        this.setState({
          musicData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Watcher ID'] = d.watcher_id;
              d['Songs Played'] = 1;
              return d;
            }),
            loadingData: false,
        }, () => {
          console.log('sorted musicData:', this.state.musicData);
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveWatcherAccounts()
      .then(res => {
        console.log('active customer accounts res:', res.data);
        this.setState({
          activeWatcherAccounts: res.data,
          activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
          activeFamilyCodes: res.data.reduce((acc, d) => [...acc, d.read_write_share_code], []),
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

  renderMusicData = (range = null) => {
    const { musicData, renderMode } = this.state;
    if (musicData.length < 1) return null;
    let filteredMusicData = musicData.slice();

    // filter data dependent on renderMode
    if (renderMode === 'watcherId') {
      filteredMusicData = musicData.filter(d => this.state.activeWatcherIds.includes(d['Watcher ID']));
    } else {
      filteredMusicData = musicData.filter(d => this.state.activeFamilyCodes.includes(d['Family Code']));
    }
    // console.log('filtered emotion data:', filteredEmotionData);
    if (filteredMusicData.length < 1) return null;

    // check for account ID filter
    if (renderMode === 'watcherId' && this.state.currentWatcherId !== 0) {
      filteredMusicData = filteredMusicData.filter(d => d['Watcher ID'] === this.state.currentWatcherId);
    }

    if (renderMode === 'familyCode' && this.state.currentFamilyCode !== '') {
      filteredMusicData = filteredMusicData.filter(d => d['Family Code'] === this.state.currentFamilyCode);
    }

    // check for date range filter
    if (range) {
      const startDate = range.startDate.format('M/DD/YY');
      const endDate = range.endDate.format('M/DD/YY');
      filteredMusicData = filteredMusicData.filter(d => {
        if (moment(d.Date, 'M/DD/YY').diff(moment(startDate, 'M/DD/YY'), 'days') >= 0 && moment(endDate, 'M/DD/YY').diff(moment(d.Date, 'M/DD/YY'), 'days') >= 0) {
          return true;
        }
        return false;
      });
    }

    // throw error if no records remain after filter
    if (filteredMusicData.length < 1) {
      this.triggerError('There are no data events over the selected date range');
      return null;
    }

    const schema = [];
    Object.keys(filteredMusicData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Songs Played') {
        node.type = 'measure';
      }
      schema.push(node);
    });

    const dm = new DataModel(filteredMusicData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(CHART_CONTAINER_WIDTH)
      .height(CHART_CONTAINER_HEIGHT)
      // .layers([{
      //   mark: 'arc',
      //     encoding: {
      //       angle: 'Device Pings',
      //     },
      // }])
      // .rows([])
      // .columns([])
      .rows(['Songs Played'])
      .columns(['Date'])
      .color(renderMode === 'familyCode' ? 'Family Code' : 'Watcher ID')
      // .color('Watcher ID')
      .mount('#chart-container')
      // .size('batt')
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
    const { musicData } = this.state;
    if (musicData.length < 1 || !this.state.hasAddedFamilyCodes) return null;
    return (
      <DataDashboard
        data={musicData}
        checkboxes={[{
          label: 'Songs Played',
          name: 'musicData',
          checked: this.state.selectedOption === 'musicData',
          onChange: (e) => {
            e.preventDefault();
            const { name } = e.target;
            this.setState({ selectedOption: name });
          },
        }]}
        searchType="watcher"
        onSearchTargetSelected={this.onWatcherSelected}
        onDateRangePicked={range => this.renderMusicData(range)}
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
          {this.renderMusicData()}
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

MusicData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  state,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(MusicData);
