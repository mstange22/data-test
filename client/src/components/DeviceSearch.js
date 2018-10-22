import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';

class DeviceSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
      accountIds: [],
    };
    this.submitted = false;
  }

  componentDidMount() {
    this.getDeviceIds();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.submitted) {
      this.handleDeviceIdChange();
    }
  }

  getDeviceIds = () => {
    const deviceIds = this.props.deviceData.reduce((accum, d) => !accum.includes(d['Device ID']) ? [...accum, d['Device ID']] : accum, []);
    // console.log('accountIds:', accountIds);
    this.setState({ deviceIds });
  }

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength === 0) return [];
    const suggestions = this.state.deviceIds
      .filter(id => id.toString().toLowerCase().slice(0, inputLength) === inputValue)
      .sort();
    // console.log('suggestions:', suggestions);
    return suggestions;
  }

  getSuggestionValue = suggestion => suggestion.toString();

  handleDeviceIdChange = (e) => {
    if (e) e.preventDefault();
    console.log('handleDeviceIdChange', this.state.value);
    this.submitted = true;
    if (this.state.deviceIds.findIndex(element => element.toString() === this.state.value) !== -1) {
      document.getElementById('chart-container').innerHTML = '';
      this.props.onDeviceIdSelected(this.state.value);
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
      placeholder: 'Enter a Device ID',
      value,
      onChange: this.onChange
    }
    return (
      <div className="watcher-search-container">
        <Autosuggest
          // multiSection={true}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          // renderSectionTitle={this.renderSectionTitle}
          // getSectionSuggestions={this.getSectionSuggestions}
          inputProps={inputProps}
          onSuggestionSelected={this.handleDeviceIdChange}
        />
      </div>
    );
  }
}

DeviceSearch.propTypes = {
  onDeviceIdSelected: PropTypes.func.isRequired,
  deviceData: PropTypes.array.isRequired,
}

export default DeviceSearch;
