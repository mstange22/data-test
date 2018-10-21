import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from "../utils/API";
import muze, { DataModel } from 'muze';

const env = muze();

class MediaUploadsData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mediaUploads: [],
    };
  }

  componentDidMount() {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ mediaUploads: [], displayMode: 'media_uploads'});
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
          }, () => {
            console.log('mediaUploads:', this.state.mediaUploads);
            this.props.setDisplayString('Number of Media Uploads (Active Accounts)');
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

  render() {
    return (
      <div id="chart-container">
        {this.renderMediaUploadsData()}
      </div>
    );
  }
}

MediaUploadsData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default MediaUploadsData;
