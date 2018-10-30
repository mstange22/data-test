import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import muze, { DataModel } from 'muze';
import moment from 'moment';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 760;
const CHART_CONTAINER_WIDTH = window.innerWidth - 310;

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderChart = () => {
    const { chartType, data, displayMode, dateRange, active } = this.props;
    if (data.length < 1) return null;
    let filteredData = data.slice();

    if (active) {
      if (displayMode === 'watcherId') {
        filteredData = data.filter(d => this.props.activeWatcherIds.includes(d['Watcher ID']));
      } else if (displayMode === 'familyCode') {
        filteredData = data.filter(d => this.props.activeFamilyCodes.includes(d['Family Code']));
      }
    }

    // check for account ID filter
    if (displayMode === 'deviceId' && this.props.currentDeviceId !== 0) {
      filteredData = filteredData.filter(d => d['Device ID'] === this.props.currentDeviceId);
    } else if (displayMode === 'familyCode' && this.props.currentFamilyCode !== '') {
      filteredData = filteredData.filter(d => d['Family Code'] === this.props.currentFamilyCode);
    } else if (displayMode === 'watcherId' && this.props.currentWatcherId !== 0) {
      filteredData = filteredData.filter(d => d['Watcher ID'] === this.props.currentWatcherId);
    }

    if (filteredData.length < 1) return null;

    // check for date range filter
    if (dateRange) {
      const startDate = dateRange.startDate.format('M/DD/YY');
      const endDate = dateRange.endDate.format('M/DD/YY');
      filteredData = filteredData.filter(d => {
        if (moment(d.Date, 'M/DD/YY').diff(moment(startDate, 'M/DD/YY'), 'days') >= 0 && moment(endDate, 'M/DD/YY').diff(moment(d.Date, 'M/DD/YY'), 'days') >= 0) {
          return true;
        }
        return false;
      });
    }

    // throw error if no records remain after filter
    if (filteredData.length < 1) {
      this.props.triggerError('There are no data events over the selected date range');
      return null;
    }

    const schema = [];
    Object.keys(filteredData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === this.props.rows) {
        node.type = 'measure';
      }
      if (chartType === 'sales-line' && key === 'Date') {
        node.subtype = 'temporal';
      }
      schema.push(node);
    });

    const dm = new DataModel(filteredData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(CHART_CONTAINER_WIDTH)
      .height(CHART_CONTAINER_HEIGHT)
      .rows([this.props.rows])
      .columns([this.props.columns])
      .color(this.props.color)
      .mount(this.props.container ? this.props.container : '#chart-container')
      .title(this.props.title)
      .subtitle(this.props.subtitle)
    ;
    return null;
  }

  render() {
    // console.log('chart data:', this.props.data);
    if (this.props.data.length < 1) return null;
    this.renderChart();
    return null;
  }
}

Chart.propTypes = {
  data: PropTypes.array.isRequired,
  chartType: PropTypes.string.isRequired,
  displayMode: PropTypes.string,
  currentFamilyCode: PropTypes.string.isRequired,
  currentWatcherId: PropTypes.number.isRequired,
  currentDeviceId: PropTypes.number.isRequired,
  rows: PropTypes.string.isRequired,
  columns: PropTypes.string.isRequired,
  color: PropTypes.string,
  triggerError: PropTypes.func.isRequired,
  activeFamilyCodes: PropTypes.array,
  activeWatcherIds: PropTypes.array,
  active: PropTypes.bool,
  dateRange: PropTypes.object,
  container: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const mapStateToProps = (state) => ({
  currentFamilyCode: state.currentFamilyCode,
  currentWatcherId: state.currentWatcherId,
  currentDeviceId: state.currentDeviceId,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
