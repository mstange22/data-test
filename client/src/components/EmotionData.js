import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import API from "../utils/API";
import muze, { DataModel } from 'muze';
import 'muze/dist/muze.css';

const env = muze();

class EmotionData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emotionData: [],
      activeWatcherIds: [],
    };
  }

  componentDidMount() {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ emotionData: [] });
    API.getEmotionData()
      .then(res => {
        this.setState({
          emotionData: res.data
            .slice()
            .sort((a, b) => a.date < b.date ? -1 : 1)
            .map(d => {
              d.date = moment.utc(d.date).format('M/DD/YY');
              return d;
            }),
        }, () => {
          console.log('emotionData:', this.state.emotionData);
          this.props.setDisplayString('Number of Smiles by Day (Active Accounts)');
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

  renderEmotionData = () => {
    const { emotionData } = this.state;
    console.log('in emotionData:', emotionData);
    if (emotionData.length < 1) {
      return null;
    }
    const schema = [];
    Object.keys(emotionData[0]).forEach(key => {
      const node = { name: key, type: 'dimension' };
      if (key === 'count') {
        node.type = 'measure';
      }
      schema.push(node);
    });
    // console.log('schema:', schema);
    const dm = new DataModel(emotionData.filter(d => this.state.activeWatcherIds.includes(d.watcher_id)), schema);
    const canvas = env.canvas();
    canvas
      .data(dm)
      .width(window.innerWidth * 0.6)
      .height(480)
      .rows(['count'])
      .columns(['date'])
      .color('watcher_id')
      .mount('#chart-container')
    ;
  }

  render() {
    return (
      <div id="chart-container">
        {this.renderEmotionData()}
      </div>
    );
  }
}

EmotionData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
}

export default EmotionData;
