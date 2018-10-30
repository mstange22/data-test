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
    const { chartType, data, displayMode, range, active } = this.props;
    let filteredData = data.slice();

    if (chartType === 'device') {
      if (displayMode === 'familyCode' && active) {
        filteredData = data.filter(d => this.props.activeFamilyCodes.includes(d['Family Code']));
      }
      // check for account ID filter
      if (displayMode === 'deviceId' && this.props.currentDeviceId !== 0) {
        filteredData = filteredData.filter(d => d['Device ID'] === this.props.currentDeviceId);
      }
      if (displayMode === 'familyCode' && this.props.currentFamilyCode !== '') {
        filteredData = filteredData.filter(d => d['Family Code'] === this.props.currentFamilyCode);
      }
    }

    console.log('in renderChart:', filteredData);
    if (filteredData.length < 1) return null;

    // check for date range filter
    if (range) {
      const startDate = range.startDate.format('M/DD/YY');
      const endDate = range.endDate.format('M/DD/YY');
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
      if (chartType === 'sales' && key === 'Date') {
        node.subtype = 'temporal';
      }
      schema.push(node);
    });

    console.log('schema:', schema);
    console.log('columns:', this.props.columns);
    console.log('rows:', this.props.rows);

    const dm = new DataModel(filteredData, schema);
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
      .rows([this.props.rows])
      .columns([this.props.columns])
      .color(this.props.color)
      .mount('#chart-container')
      // .size('batt')
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
};

const mapStateToProps = (state) => ({
  currentFamilyCode: state.currentFamilyCode,
  currentWatcherId: state.currentWatcherId,
  currentDeviceId: state.currentDeviceId,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
