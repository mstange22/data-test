import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from "../utils/API";
import moment from 'moment';
import muze, { DataModel } from 'muze';
import 'muze/dist/muze.css';
import '../css/style.css';

const env = muze();

class DataTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchData: [],
      customerAccounts: [],
      activeWatcherIds: [],
      mediaUploads: [],
      emotionData: [],
      displayMode: 'none',
      displayString: '',
    };
  }

  componentDidMount() {
    this.checkDisplayMode(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.displayMode !== newProps.displayMode) {
      this.checkDisplayMode(newProps);
    }
  }

  checkDisplayMode = (props) => {
    switch (props.displayMode) {
      case 'watch':
        this.handleWatchDataQuery();
        break;
      case 'media_uploads':
        this.handleMediaUploadsQuery();
        break;
      case 'emotion':
        this.handleEmotionDataQuery();
        break;
      default:
        break;
    }
  }

  handleWatchDataQuery = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ watchData: [], displayMode: 'watch'});
    API.getWatchData()
      .then(res => {
        this.setState({
          watchData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d.date = moment.utc(d.date).format('M/DD/YY');
              d.sum_watch_minutes = (d.sum_watch / 1000 / 60).toFixed();
              return d;
            }),
          displayString: 'Minutes Watched by Day (Active Accounts)'
        }, () => {
          this.props.setDisplayString(this.state.displayString);
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
          console.log('active watcher IDs:', this.state.activeWatcherIds)
        });
      })
      .catch(err => console.log(err.message));
  }

  handleMediaUploadsQuery = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ mediaUploads: [], displayMode: 'media_uploads'});
    API.getMediaUploadsData()
      .then(res => {
        // console.log('media uploads res:', res.data);
          const mediaUploads = res.data.reduce((accum, d) => {
            if (d.media_count === 0) {
              accum[0]['Number of Users'] += d['count(x.album_id)'];
            } else if (d.media_count <= 10) {
              accum[1]['Number of Users'] += d['count(x.album_id)'];
            } else if (d.media_count <= 20) {
              accum[2]['Number of Users'] += d['count(x.album_id)'];
            } else if (d.media_count <= 50) {
              accum[3]['Number of Users'] += d['count(x.album_id)'];
            } else if (d.media_count <= 100) {
              accum[4]['Number of Users'] += d['count(x.album_id)'];
            } else {
              accum[5]['Number of Users'] += d['count(x.album_id)'];
            }
            return accum;
          }, [{
              Uploads: '0', 'Number of Users': 0,
            }, {
              Uploads: '1 - 10', 'Number of Users': 0,
            }, {
              Uploads: '11 - 20', 'Number of Users': 0,
            }, {
              Uploads: '21 - 50', 'Number of Users': 0,
            }, {
              Uploads: '51 - 100', 'Number of Users': 0,
            }, {
              Uploads: '100+', 'Number of Users': 0,
            },
          ]);
          this.setState({
            mediaUploads,
            displayString: 'Number of Media Uploads (Active Accounts)'
          }, () => {
            this.props.setDisplayString(this.state.displayString);
          });
      })
      .catch(err => console.log(err.message));
  }

  handleEmotionDataQuery = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ emotionData: [], displayMode: 'emotion'});
    API.getEmotionData()
      .then(res => {
        // console.log('emotion res:', res.data);
        this.setState({
          emotionData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d.date = moment.utc(d.date).format('M/DD/YY');
              return d;
            }),
          displayString: 'Number of Smiles by Day (Active Accounts)',
        }, () => {
          this.props.setDisplayString(this.state.displayString);
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

  renderWatchData = () => {
    const { watchData, displayMode } = this.state;
    // console.log('in watchData:', watchData, displayMode);
    if (watchData.length < 1 || displayMode !== 'watch') return null;
    const schema = [];
    Object.keys(watchData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'sum_watch_minutes') {
        node.type = 'measure';
      // } else if (key === 'date') {
      //   node.subtype = 'temporal';
      }
      schema.push(node);
    });
    const dm = new DataModel(watchData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id)), schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth * 0.6)
      .height(480)
      .rows(['sum_watch_minutes'])
      .columns(['date'])
      .color('watcher_id')
      .mount('#chart-container')
    ;
  }

  renderMediaUploadsData = () => {
    const { mediaUploads, displayMode } = this.state;
    // console.log('in mediaUploads:', mediaUploads, displayMode);
    if (mediaUploads.length < 1 || displayMode !== 'media_uploads') {
      return null;
    }
    const schema = [{
        name: 'Uploads',
        type: 'dimension',
      }, {
        name: 'Number of Users',
        type: 'measure',
      },
    ];
    // console.log('schema:', schema);
    const dm = new DataModel(mediaUploads, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth * 0.6)
      .height(480)
      .rows(['Number of Users'])
      .columns(['Uploads'])
      .mount('#chart-container')
    ;
  }

  renderEmotionData = () => {
    const { emotionData, displayMode } = this.state;
    // console.log('in emotionData:', emotionData, displayMode);
    if (emotionData.length < 1 || displayMode !== 'emotion') {
      return null;
    }
    const schema = [];
    Object.keys(emotionData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'count') {
        node.type = 'measure';
      }
      schema.push(node);
    });
    // console.log('schema:', schema);
    const dm = new DataModel(emotionData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id)), schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth * 0.6)
      .height(480)
      .rows(['count'])
      .columns(['date'])
      .color('watcher_id')
      .mount('#chart-container')
    ;
  }

  renderDataHeader = () => {
    const { displayString } = this.state;
    if (displayString === '') {
      return null;
    }
    return (
      <div>
        <h2>{displayString}</h2>
      </div>
    )
  }

  render() {
    return (
      <div className="content-container">
        {/* <div className="button-container">
          <Button
            className="rx-btn"
            onClick={this.handleWatchDataQuery}
            bsStyle="primary"
            bsSize="large"
            block
          >
            Sum Watch Minutes (by Day)
          </Button>
          <Button
            className="rx-btn"
            onClick={this.handleMediaUploadsQuery}
            bsStyle="primary"
            bsSize="large"
            block
          >
            Active User Media Count
          </Button>
          <Button
            className="rx-btn"
            onClick={this.handleEmotionDataQuery}
            bsStyle="primary"
            bsSize="large"
            block
          >
            Active User Emotion Data (Smiles)
          </Button>
        </div> */}
        {/* <div className="data-container">
          {this.renderDataHeader()}
          <div id="chart-container" />
        </div> */}
        {this.renderWatchData()}
        {this.renderMediaUploadsData()}
        {this.renderEmotionData()}
      </div>
    );
  }
}

DataTest.propTypes = {
  displayMode: PropTypes.string.isRequired,
  setDisplayString: PropTypes.func.isRequired,
}

export default DataTest;
