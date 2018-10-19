import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';

class WatcherSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
      watcherIds: [],
    };
    this.submitted = false;
  }

  componentDidMount() {
    this.getWatcherIds();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.submitted) {
      this.handleAccountChange();
    }
  }

  getWatcherIds = () => {
    const watcherIds = this.props.activeUserData.reduce((accum, d) => {
      if (accum.findIndex(elem => elem.watcher_id === d.watcher_id) === -1) {
        return ([...accum, { watcher_id: d.watcher_id, familyCode: d.familyCode }]);
      } else {
        return accum;
      }
    }, []);
    this.setState({ watcherIds });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : this.state.watcherIds.filter(id => id.watcher_id.toString().toLowerCase().slice(0, inputLength) === inputValue);
  };

  getSuggestionValue = suggestion => suggestion.watcher_id.toString();

  handleAccountChange = (e) => {
    if (e) e.preventDefault();
    console.log('handleAccountChange', this.state.value);
    this.submitted = true;
    if (this.state.watcherIds.findIndex(element => element.watcher_id.toString() === this.state.value) !== -1) {
      document.getElementById('chart-container').innerHTML = '';
      this.props.onWatcherIdSelected(parseInt(this.state.value, 10));
      this.submitted = false;
    }
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  renderSuggestion = suggestion => (
    <div>
      {suggestion.watcher_id.toString()}
    </div>
  );

  render() {
    console.log('state value:', this.state.value);
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: 'Type a family code or watcher ID',
      value,
      onChange: this.onChange
    }
    return (
      <div className="watcher-search-container">
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
          onSuggestionSelected={this.handleAccountChange}
        />
      </div>
    );
  }
}

WatcherSearch.propTypes = {
  onWatcherIdSelected: PropTypes.func.isRequired,
  activeUserData: PropTypes.array.isRequired,
  activeWatcherAccounts: PropTypes.array.isRequired,
}

export default WatcherSearch;
