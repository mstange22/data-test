import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import Spinner from '../components/Spinner';
import MediaUploadsChart from '../components/MediaUploadsChart';
import KpiData from '../components/KpiData';

class MediaData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mediaUploads: [],
      activeAlbumIds: [],
      activeMediaUploads: [],
      loadingData: false,
      gotDailyUploads: false,
    };
  }

  componentDidMount() {
    // document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Number of Media Uploads (Active Accounts)');
    this.setState({ loadingData: true });
    API.getMediaUploads()
      .then(res => {
          console.log('mediaUploads:', res.data);
          this.setState({
            // mediaUploads: res.data.filter(d => d.type === 'image' || d.type === 'video'),
            mediaUploads: res.data,
            loadingData: false,
          });
      })
      .catch(err => console.log(err.message));
  }

  renderMediaUploadsChart = () => {
    if (this.state.mediaUploads.length < 1) return null;
    return (
      <MediaUploadsChart />
    );
  }

  render() {
    return (
      <div className="data-container">
        <Spinner loading={this.state.loadingData} />
        <KpiData
          kpiData={this.state.mediaUploads}
        />
        {this.renderMediaUploadsChart()}
      </div>
    );
  }
}

MediaData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(MediaData);
