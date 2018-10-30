import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import moment from 'moment';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import KpiData from '../components/KpiData';
import Chart from '../components/Chart';
import {
  setCurrentFamilyCode,
  setCurrentDeviceId,
} from '../redux/actions';

class DeviceData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceData: [],
      activeWatcherAccounts: [],
      activeWatcherIds: [],
      activeFamilyCodes: [],
      displayError: false,
      errorMessage: '',
      displayMode: 'familyCode',
      checked: false,
      loadingData: false,
      range: null,
    };
  }

  componentDidMount() {
    this.getDeviceData();
  }

  getDeviceData = () => {
    document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Device Data');
    this.setState({ deviceData: [], loadingData: true });
    API.getDeviceData()
      .then(res => {
        this.setState({
          deviceData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Device ID'] = d.device_id;
              d['Family Code'] = d.code;
              d['Device Pings'] = 1;
              d.create_date = d.date;
              return d;
            }),
            loadingData: false,
        }, () => {
          console.log('sorted deviceData:', this.state.deviceData);
        });
      })
      .catch(err => console.log(err.message));
    API.getActiveWatcherAccounts()
      .then(res => {
        console.log('active customer accounts res:', res.data);
        this.setState({
          activeWatcherAccounts: res.data,
          activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
          activeFamilyCodes: res.data.reduce((acc, d) => [...acc, d.read_write_share_code], []),
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

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  onDeviceSelected = (device, displayMode) => {
    if (displayMode === 'familyCode') {
      this.setState({ displayMode, checked: false });
      this.props.setCurrentFamilyCode(device);
      this.props.setCurrentDeviceId(0);
    } else {
      this.setState({ displayMode, checked: false });
      this.props.setCurrentFamilyCode('');
      this.props.setCurrentDeviceId(device);
    }
  }

  renderDashboard = () => {
    const { deviceData } = this.state;
    if (deviceData.length < 1) return null;
    return (
      <DataDashboard
        data={deviceData}
        checkboxes={[{
          label: 'Only Display Active Accounts',
          name: 'activeOnly',
          checked: this.state.checked,
          onChange: (e) => {
            document.getElementById('chart-container').innerHTML = '';
            this.setState({
              checked: e.target.checked,
              displayMode: e.target.checked ? 'familyCode' : 'deviceId',
            });
          },
        }]}
        searchType="device"
        onSearchTargetSelected={this.onDeviceSelected}
        onDateRangePicked={range => this.setState({ range })}
      />
    );
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
    return (
      <Spinner />
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
    );
  }

  renderChart = () => {
    const { deviceData, displayMode, activeFamilyCodes, checked, range } = this.state;
    if (deviceData.length < 1 || activeFamilyCodes.length < 1) return null;
    return (
      <Chart
        data={deviceData}
        chartType="device"
        range={range}
        displayMode={displayMode}
        activeFamilyCodes={activeFamilyCodes}
        active={checked}
        triggerError={this.triggerError}
        rows={'Device Pings'}
        columns={'Date'}
        color={this.state.displayMode === 'familyCode' ? 'Family Code' : 'Device ID'}
      />
    );
  }

  render() {
    return (
      <div className="data-container">
        <KpiData
          kpiData={this.state.deviceData}
        />
        <div id="chart-container">
          {this.renderSpinner()}
          {this.renderChart()}
        </div>
        {this.renderDashboard()}
        {this.renderNotification()}
      </div>
    );
  }
}

DeviceData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = {
  setCurrentFamilyCode,
  setCurrentDeviceId,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceData);
