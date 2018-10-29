import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import API from "../utils/API";
import Spinner from '../components/Spinner';
import MediaUploadsData from '../components/MediaUploadsData';

const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

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
    this.setState({ mediaUploads: [], loadingData: true });
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

  // componentDidUpdate() {
  //   if (this.state.mediaUploads.length > 1 && !this.state.gotDailyUploads) {
  //     const mediaUploads = this.state.mediaUploads.slice();
  //     const dailyUploads = mediaUploads.filter(m => {
  //       if (m.create_date) {
  //         const momentDate = moment.utc(m.create_date).hours(0);
  //         console.log('momentDate:', momentDate);
  //         const momentNow = moment().hours(0);
  //         console.log('momentNow:', momentNow);
  //         return momentNow.diff(momentDate, 'days') === 1;
  //       }
  //       return false;
  //     });
  //     this.setState({ dailyUploads, gotDailyUploads: true }, () => console.log('dailyUploads:', this.state.dailyUploads));
  //   }
  // }

  getDisplayColor = (curr, prev) => {
    if (curr > prev) return ' success';
    if (curr < prev) return ' danger';
    return ' warning';
  }

  renderKpiData = () => {
    const { mediaUploads } = this.state;
    if (mediaUploads.length < 1) return null;

    const dailyUploads = mediaUploads.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).hours(0), 'days') < 1));
    const previousDay = mediaUploads.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).hours(0), 'days') >= 1)
      && (moment().diff(moment.utc(m.create_date).hours(0), 'days') < 2));
    const weeklyUploads = mediaUploads.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).hours(0), 'days') < 7));
    const previousWeek = mediaUploads.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).hours(0), 'days') >= 7)
      && (moment().diff(moment.utc(m.create_date), 'days') < 14));
    const monthlyUploads = mediaUploads.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).hours(0), 'days') <= 30));
    const previousMonth = mediaUploads.filter(m => m.create_date && (moment().hours(0).diff(moment.utc(m.create_date).hours(0), 'days') > 30)
      && (moment().diff(moment.utc(m.create_date), 'days') < 60));

    return (
      <div className="kpi-container">
        <div className="kpi-display-box info">
          <div className="kpi-header"> Total Media Uploads</div>
          <div className="kpi-total">
          {mediaUploads.length}
          </div>
        </div>
        <div className={`kpi-display-box${this.getDisplayColor(dailyUploads, previousDay)}`}>
          <div className="kpi-header">Media Uploads Today</div>
          <div className="kpi-total">
            {dailyUploads.length}
          </div>
          <div className="kpi-last">
            {'Previous Day: '}
            <span>
              {previousDay.length}
            </span>
          </div>
        </div>
        <div className={`kpi-display-box${this.getDisplayColor(weeklyUploads, previousWeek)}`}>
          <div className="kpi-header">Media Uploads This Week</div>
          <div className="kpi-total">
            {weeklyUploads.length}
          </div>
          <div className="kpi-last">
            {'Previous Week: '}
            <span>
              {previousWeek.length}
            </span>
          </div>
        </div>
        <div className={`kpi-display-box${this.getDisplayColor(monthlyUploads, previousMonth)}`}>
          <div className="kpi-header">Media Uploads This Month</div>
          <div className="kpi-total">
            {monthlyUploads.length}
          </div>
          <div className="kpi-last">
            {'Previous Month: '}
            <span>
              {previousMonth.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
    return (
      <Spinner height={CHART_CONTAINER_HEIGHT} width={CHART_CONTAINER_WIDTH} />
    );
  }

  renderMediaUploadsData = () => {
    if (this.state.mediaUploads.length < 1) return null;
    return (
      <MediaUploadsData />
    );
  }

  render() {
    return (
      <div className="data-container">
          {this.renderSpinner()}
          {this.renderKpiData()}
          {this.renderMediaUploadsData()}
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
