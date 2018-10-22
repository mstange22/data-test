import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';
import DateRangePicker from '../components/DateRangePicker';
import Notification from '../components/Notification';
import DeviceSearch from '../components/DeviceSearch';
import Spinner from '../components/Spinner';

const env = muze();
const CHART_CONTAINER_HEIGHT = 480;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

class DeviceData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceData: [],
      renderMode: 'Device ID',
      displayError: false,
      errorMessage: '',
      currentDeviceId: 0,
      selectedOption: 'deviceData',
      loadingData: false,
    };
  }

  componentDidMount() {
    this.getDeviceData();
  }

  getDeviceData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ deviceData: [], loadingData: true });
    API.getDeviceData()
      .then(res => {
        this.props.setDisplayString('Device Data');
        console.log('deviceData res:', res.data);
        this.setState({
          deviceData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Device ID'] = d.device_id;
              d['Family Code'] = d.code;
              d['Device Pings'] = 1;
              return d;
            }),
            loadingData: false,
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

  renderDeviceData = (range = null) => {
    let filteredDeviceData = this.state.deviceData.slice();
    if (filteredDeviceData.length < 1) {
      return null;
    }

    // check for account ID filter
    if (this.state.currentDeviceId !== 0) {
      console.log('currentDeviceId:', this.state.currentDeviceId);
      filteredDeviceData = filteredDeviceData.filter(d => {
        if (d['Device ID'] === this.state.currentDeviceId) {
          console.log('**** match ****');
          return true;
        }
        return false;
      });
    }

    // check for date range filter
    if (range) {
      const startDate = range.startDate.format('M/DD/YY');
      const endDate = range.endDate.format('M/DD/YY');
      filteredDeviceData = filteredDeviceData.filter(d => {
        if (moment(d.Date, 'M/DD/YY').diff(moment(startDate, 'M/DD/YY'), 'days') >= 0 && moment(endDate, 'M/DD/YY').diff(moment(d.Date, 'M/DD/YY'), 'days') >= 0) {
          return true;
        }
        return false;
      });
    }

    // throw error if no records remain after filter
    if (filteredDeviceData.length < 1) {
      this.triggerError('There are no data events over the selected date range');
      return null;
    }

    const schema = [];
    Object.keys(filteredDeviceData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Device Pings') {
        node.type = 'measure';
      }
      schema.push(node);
    });

    const dm = new DataModel(filteredDeviceData, schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(CHART_CONTAINER_WIDTH)
      .height(CHART_CONTAINER_HEIGHT)
      .rows(['Device Pings'])
      .columns(['Date'])
      .color('Family Code')
      .mount('#chart-container')
    ;
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  renderDashboard = () => {
    const { deviceData } = this.state;
    if (deviceData.length < 1 || this.state.displayError) return null;
    return (
      <div className="data-dashboard">
        <div className="form-input-container">
          <label className="checkbox-label">
            <input
              name="deviceData"
              type="checkbox"
              checked={this.state.selectedOption === 'deviceData'}
              onChange={this.handleInputChange}
            />
            {'Device Pings'}
          </label>
          <DeviceSearch
            deviceData={deviceData}
            onDeviceIdSelected={(currentDeviceId) => this.setState({ currentDeviceId })}
          />
        </div>
        <DateRangePicker
          onDateRangePicked={(range) => this.renderDeviceData(range)}
          minDate={moment(deviceData[0].Date, 'M/DD/YY')}
          maxDate={moment(deviceData[deviceData.length - 1].Date, 'M/DD/YY')}
        />
      </div>
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
    )
  }

  render() {
    return (
      <div className="data-dashboard">
        <div id="chart-container">
          {this.renderSpinner()}
          {this.renderDeviceData()}
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

DeviceData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  state,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceData);
