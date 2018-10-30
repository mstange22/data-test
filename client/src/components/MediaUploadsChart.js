import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import Spinner from './Spinner';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 310;

class MediaUploadsChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mediaUploads: [],
      loadingData: false,
    };
  }

  componentDidMount() {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ mediaUploads: [], loadingData: true });
    API.getMediaUploadsByBucket()
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
          console.log('mediaUploads:', mediaUploads);
          this.setState({
            mediaUploads,
            loadingData: false,
          });
      })
      .catch(err => console.log(err.message));
  }

  renderMediaUploadsChart = () => {
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
      .width(CHART_CONTAINER_WIDTH)
      .height(CHART_CONTAINER_HEIGHT)
      .rows(['Number of Users'])
      .columns(['Uploads'])
      .mount('#chart-container')
    ;
  }

  render() {
    return (
      <div className="data-container">
        <div id="chart-container">
          <Spinner loading={this.state.loadingData} />
          {this.renderMediaUploadsChart()}
        </div>
      </div>
    );
  }
}

MediaUploadsChart.propTypes = {
};

export default MediaUploadsChart;
