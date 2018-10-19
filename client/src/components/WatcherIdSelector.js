import React, { Component } from 'react';
import PropTypes from 'prop-types';

class WatcherIdSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWatcherId: 0,
    };
  }

  handleAccountChange = (e) => {
    document.getElementById('chart-container').innerHTML = '';
    this.setState({ currentWatcherId: e.target.value }, () => {
      this.props.onWatcherIdSelected(parseInt(this.state.currentWatcherId, 10));
    });
  }

  render() {
    const watcherIds = this.props.activeUserData.reduce((accum, d) => {
      if (accum.findIndex(elem => elem.watcher_id === d.watcher_id) === -1) {
        return ([...accum, { watcher_id: d.watcher_id, familyCode: d.familyCode }]);
      } else {
        return accum;
      }
    }, []);
    return (
      <select
        value={this.state.currentWatcherId}
        onChange={this.handleAccountChange}
      >
        <option className="select-placeholder" disabled value={0}>
          Select a Watcher ID
        </option>
        <option className="select-placeholder" value={0}>
          None
        </option>
        {watcherIds.sort((a, b) => a.watcher_id - b.watcher_id).map(id => {
          return (
            <option
              key={id.watcher_id}
              value={id.watcher_id}
            >
              {`${id.watcher_id} - ${id.familyCode}`}
            </option>
          );
        })}
      </select>
    );
  }
}

WatcherIdSelector.propTypes = {
  onWatcherIdSelected: PropTypes.func.isRequired,
  activeUserData: PropTypes.array.isRequired,
  activeWatcherAccounts: PropTypes.array.isRequired,
}

export default WatcherIdSelector;
