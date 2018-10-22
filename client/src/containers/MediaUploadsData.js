import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import Spinner from '../components/Spinner';

const env = muze();
const CHART_CONTAINER_HEIGHT = 480;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

class MediaUploadsData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mediaUploads: [],
      loadingData: false,
    };
  }

  componentDidMount() {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Number of Media Uploads (Active Accounts)');
    this.setState({ mediaUploads: [], loadingData: true });
    API.getMediaUploadsData()
      .then(res => {
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
            loadingData: false,
          });
      })
      .catch(err => console.log(err.message));
  }

  renderMediaUploadsData = () => {
    const { mediaUploads } = this.state;
    if (mediaUploads.length < 1) {
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
      .width(window.innerWidth - 280)
      .height(480)
      .rows(['Number of Users'])
      .columns(['Uploads'])
      // .color('watcher_id')
      .mount('#chart-container')
    ;
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
    return (
      <Spinner height={CHART_CONTAINER_HEIGHT} width={CHART_CONTAINER_WIDTH} />
    );
  }

  render() {
    return (
      <div id="chart-container">
        {this.renderSpinner()}
        {this.renderMediaUploadsData()}
      </div>
    );
  }
}

MediaUploadsData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default MediaUploadsData;
