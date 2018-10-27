import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import moment from 'moment';
import DataDashboard from '../components/DataDashboard';
import Notification from '../components/Notification';
import Spinner from '../components/Spinner';
import { setSearchValue } from '../redux/actions';

const env = muze();
const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

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
      currentDeviceId: 0,
      currentFamilyCode: '',
      renderMode: 'familyCode',
      checked: false,
      loadingData: false,
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

  renderDeviceData = (range = null) => {
    const { deviceData, renderMode } = this.state;
    if (deviceData.length < 1 || this.state.activeFamilyCodes.length < 1) return null;
    let filteredDeviceData = deviceData.slice();

    if (renderMode === 'familyCode' && this.state.checked) {
      filteredDeviceData = deviceData.filter(d => this.state.activeFamilyCodes.includes(d['Family Code']));
    }

    // check for account ID filter
    if (renderMode === 'deviceId' && this.state.currentDeviceId !== 0) {
      filteredDeviceData = filteredDeviceData.filter(d => d['Device ID'] === this.state.currentDeviceId);
    }

    if (renderMode === 'familyCode' && this.state.currentFamilyCode !== '') {
      filteredDeviceData = filteredDeviceData.filter(d => d['Family Code'] === this.state.currentFamilyCode);
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
      // .layers([{
      //   mark: 'arc',
      //     encoding: {
      //       angle: 'Device Pings',
      //     },
      // }])
      // .rows([])
      // .columns([])
      .rows(['Device Pings'])
      .columns(['Date'])
      .color(renderMode === 'familyCode' ? 'Family Code' : 'Device ID')
      .mount('#chart-container')
      // .size('batt')
    ;
    return null;
  }

  handleInputChange = (e) => {
    e.preventDefault();
    const { name } = e.target;
    this.setState({ selectedOption: name });
  }

  onDeviceSelected = (device, renderMode) => {
    if (renderMode === 'familyCode') {
      this.setState({ currentFamilyCode: device, currentDeviceId: 0, renderMode, checked: false });
    } else {
      this.setState({ currentDeviceId: device, currentFamilyCode: '', renderMode, checked: false });
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
              renderMode: e.target.checked ? 'familyCode' : 'deviceId',
              currentFamilyCode: '',
              currentDeviceId: 0,
             });
             this.props.setSearchValue('');
          },
        }]}
        searchType="device"
        onSearchTargetSelected={this.onDeviceSelected}
        onDateRangePicked={range => this.renderDeviceData(range)}
        clearFilterButtonDisabled={this.state.currentFamilyCode === '' && this.state.currentDeviceId === 0}
        clearFilterButtonOnClick={() => this.setState({ currentFamilyCode: '', currentDeviceId: 0 })}
      />
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
    );
  }

  render() {
    return (
      <div className="data-container">
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
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
  setSearchValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceData);
