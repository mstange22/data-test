import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';

class WatcherSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
      watcherInfo: [],
      watcherIds: [],
      familyCodes: [],
    };
    this.submitted = false;
  }

  componentDidMount() {
    this.getWatcherInfo();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.submitted) {
      this.handleWatcherChange();
    }
  }

  getWatcherInfo = () => {
    const watcherIds = this.props.activeUserData.reduce((accum, d) => !accum.includes(d['Watcher ID']) ? [...accum, d['Watcher ID']] : accum, []);
    const familyCodes = this.props.activeUserData.reduce((accum, d) => !accum.includes(d['Family Code']) ? [...accum, d['Family Code']] : accum, []);
    const watcherInfo = [{
      title: 'Family Codes',
      info: familyCodes,
    }, {
      title: 'Watcher IDs',
      info: watcherIds,
    }];
    // console.log('watcherInfo:', watcherInfo);
    this.setState({ watcherIds, familyCodes, watcherInfo });
  }

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength === 0) return [];
    const suggestions = this.state.watcherInfo
      .map(section => {
        return {
          title: section.title,
          info: section.info.filter(id => id.toString().toLowerCase().slice(0, inputLength) === inputValue)
        };
      })
      .filter(section => section.info.length > 0);
    // console.log('suggestions:', suggestions);
    return suggestions;
  }

  getSuggestionValue = suggestion => suggestion.toString();

  handleWatcherChange = (e) => {
    if (e) e.preventDefault();
    // console.log('handleAccountChange', this.state.value);
    this.submitted = true;
    if (this.state.watcherIds.findIndex(element => element.toString() === this.state.value) !== -1) {
      document.getElementById('chart-container').innerHTML = '';
      this.props.onWatcherSelected(parseInt(this.state.value, 10), 'watcherId');
      this.submitted = false;
    } else if (this.state.familyCodes.findIndex(element => element === this.state.value) !== -1) {
      document.getElementById('chart-container').innerHTML = '';
      this.props.onWatcherSelected(this.state.value, 'familyCode');
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
      {suggestion.toString()}
    </div>
  );

  renderSectionTitle = (section) => {
    return (
      <strong>{section.title}</strong>
    );
  }

  getSectionSuggestions = (section) => {
    return section.info;
  }

  render() {
    // console.log('state value:', this.state.value);
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: 'Enter a Family Code or Watcher ID',
      value,
      onChange: this.onChange
    }
    return (
      <div className="watcher-search-container">
        <Autosuggest
          multiSection={true}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          renderSectionTitle={this.renderSectionTitle}
          getSectionSuggestions={this.getSectionSuggestions}
          inputProps={inputProps}
          onSuggestionSelected={this.handleWatcherChange}
        />
      </div>
    );
  }
}

WatcherSearch.propTypes = {
  onWatcherSelected: PropTypes.func.isRequired,
  activeUserData: PropTypes.array.isRequired,
  activeWatcherAccounts: PropTypes.array.isRequired,
}

export default WatcherSearch;
