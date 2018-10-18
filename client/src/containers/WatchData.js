import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import 'muze/dist/muze.css';

const env = muze();

class WatchData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchData: [],
      activeWatcherIds: [],
    };
  }

  componentDidMount() {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ watchData: [] });
    API.getWatchData()
      .then(res => {
        this.setState({
          watchData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d['Date'] = moment.utc(d.date).format('M/DD/YY');
              d['Total Watch Minutes'] = (d.sum_watch / 1000 / 60).toFixed();
              return d;
            }),
          displayString: 'Minutes Watched by Day (Active Accounts)',
        }, () => {
          console.log('cleaned watchData:', this.state.watchData);
          this.props.setDisplayString('Minutes Watched by Day (Active Accounts)');
        });
      })
      .catch(err => console.log(err.message));

    API.getActiveAccounts()
      .then(res => {
        // console.log('active customer accounts:', res.data);
        this.setState({
          customerAccounts: res.data,
          activeWatcherIds: res.data.reduce((acc, d) => [...acc, d.patient_account_id], []),
        }, () => {
          // console.log('active watcher IDs:', this.state.activeWatcherIds);
        });
      })
      .catch(err => console.log(err.message));
  }

  renderWatchData = () => {
    const { watchData } = this.state;
    if (watchData.length < 1) return null;
    const schema = [];
    Object.keys(watchData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'Total Watch Minutes') {
        node.type = 'measure';
      // } else if (key === 'date') {
      //   node.subtype = 'temporal';
      }
      schema.push(node);
    });
    const dm = new DataModel(watchData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id)), schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth - 280)
      .height(480)
      .rows(['Total Watch Minutes'])
      .columns(['Date'])
      .color('watcher_id')
      .mount('#chart-container')
    ;
  }

  render() {
    return (
      <div id="chart-container">
        {this.renderWatchData()}
      </div>
    );
  }
}

WatchData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default WatchData;
