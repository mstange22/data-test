import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Row, Col, Button } from 'react-bootstrap';
import API from "./utils/API";
import moment from 'moment';
import muze, { DataModel } from 'muze';
import 'muze/dist/muze.css';
import './css/style.css';
// require('moment-duration-format');

const env = muze();

class DataTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchData: [],
      customerAccounts: [],
      activeWatcherIds: [],
      mediaUploads: [],
      displayMode: 'none',
    };
  }

  handleMediaUploadsQuery = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ mediaUploads: [], displayMode: 'media_uploads'});
    API.getMediaUploadsData()
      .then(res => {
        // console.log('media uploads res:', res.data);
          const mediaUploads = res.data.reduce((accum, d) => {
            if (d.media_count === 0) {
              accum[0].uploads += d['count(x.album_id)'];
            } else if (d.media_count <= 10) {
              accum[1].uploads += d['count(x.album_id)'];
            } else if (d.media_count <= 20) {
              accum[2].uploads += d['count(x.album_id)'];
            } else if (d.media_count <= 50) {
              accum[3].uploads += d['count(x.album_id)'];
            } else if (d.media_count <= 100) {
              accum[4].uploads += d['count(x.album_id)'];
            } else {
              accum[5].uploads += d['count(x.album_id)'];
            }
            return accum;
          }, [{
              distribution: 'media_count_0', uploads: 0,
            }, {
              distribution: 'media_count_10', uploads: 0,
            }, {
              distribution: 'media_count_20', uploads: 0,
            }, {
              distribution: 'media_count_50', uploads: 0,
            }, {
              distribution: 'media_count_100', uploads: 0,
            }, {
              distribution: 'media_count_100_plus', uploads: 0,
            },
          ]);
          this.setState({ mediaUploads }, () => {
            console.log('media uploads buckets:', this.state.mediaUploads);
          });
      });
  }

  handleClick = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ watchData: [], displayMode: 'watch'});
    API.getWatchData()
      .then(res => {
        // console.log('watch data:', res.data);
        this.setState({
          watchData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d.date = moment.utc(d.date).format('M/DD/YY');
              d.sum_watch_minutes = (d.sum_watch / 1000 / 60).toFixed();
              return d;
            }),
        }, () => {
          console.log('cleaned watch data:', this.state.watchData);
        });
      })
      .catch(err => console.log(err.message));

    API.getActiveAccounts()
      .then(res => {
        console.log('active customer accounts:', res.data);
        this.setState({
          customerAccounts: res.data,
          activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
        }, () => {
          console.log('active watcher IDs:', this.state.activeWatcherIds)
        });
      })
      .catch(err => console.log(err.message));
  }

  renderWatchData = () => {
    const { watchData, displayMode } = this.state;
    console.log('in watchData:', watchData, displayMode);
    if (watchData.length < 1 || displayMode !== 'watch') return null;
    const schema = [];
    Object.keys(watchData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'sum_watch_minutes') {
        node.type = 'measure';
      // } else if (key === 'date') {
      //   node.subtype = 'temporal';
      }
      // console.log('node:', node);
      schema.push(node);
    });
    console.log('schema', schema);
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
    console.log('in mediaUploads:', mediaUploads, displayMode);
    if (mediaUploads.length < 1 || displayMode !== 'media_uploads') {
      return null;
    }
    const schema = [{
        name: 'distribution',
        type: 'dimension',
      }, {
        name: 'uploads',
        type: 'measure',
      },
    ];
    console.log('schema:', schema);
    const dm = new DataModel(mediaUploads, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth * 0.6)
      .height(480)
      .rows(['uploads'])
      .columns(['distribution'])
      .mount('#chart-container')
    ;
  }

  render() {
    return (
      <div className="page-container">
        <h1>ReminX Data Portal</h1>
        <Row className="button-container">
            <Col md={4}>
            <Button
              className="rx-btn"
              onClick={this.handleClick}
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
          </Col>
          <Col md={8}>
            <div id="chart-container" />
          </Col>
        </Row>
        {this.renderWatchData()}
        {this.renderMediaUploadsData()}
      </div>
    );
  }
}

// DataTest.propTypes = {

// };

// loadSavedArticles = () => {
//   API.getArticles()
//     .then(res =>
//       this.setState({ savedArticles: res.data })
//     )
//     .catch(err => console.log(err));
// };

// saveArticle = (article) => {
//   API.saveArticle(article)
//     .then(res =>
//       this.loadSavedArticles()
//     )
//     .catch(err => console.log(err));
// };

// deleteArticle = (headline) => {
//   API.deleteArticle(headline)
//     .then(res => {
//       this.loadSavedArticles();
//     })
//     .catch(err => console.log(err.message));
// }

export default DataTest;
