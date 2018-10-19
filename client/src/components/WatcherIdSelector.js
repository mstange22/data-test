import React, { Component} from 'react';
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
      this.props.onWatcherIdSelected(this.state.currentWatcherId);
    });
  }

  render() {
    const watcherIds = this.props.activeUserData.reduce((accum, d) => {
      if (!accum.includes(d.watcher_id)) {
        return ([...accum, d.watcher_id]);
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
        {watcherIds.sort().map(id => {
          return (
            <option
              key={id}
              value={id}
            >
              {id}
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
}

export default WatcherIdSelector;
