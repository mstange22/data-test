import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';

class DeviceSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
      deviceInfo: [],
      deviceIds: [],
      familyCodes: [],
    };
    this.submitted = false;
  }

  componentDidMount() {
    this.getDeviceInfo();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.submitted) {
      this.handleDeviceChange();
    }
    if (this.props.value !== this.state.value) {
      this.setState({ value: this.props.value });
    }
  }

  getDeviceInfo = () => {
    const deviceIds = this.props.deviceData.reduce((accum, d) => !accum.includes(d['Device ID']) ? [...accum, d['Device ID']] : accum, []);
    const familyCodes = this.props.deviceData.reduce((accum, d) => !accum.includes(d['Family Code']) ? [...accum, d['Family Code']] : accum, []);
    const deviceInfo = [{
      title: 'Family Codes',
      info: familyCodes,
    }, {
      title: 'Device IDs',
      info: deviceIds,
    }];
    // console.log('accountIds:', accountIds);
    this.setState({ deviceIds, familyCodes, deviceInfo });
  }

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength === 0) return [];
    const suggestions = this.state.deviceInfo
      .map(section => {
        return {
          title: section.title,
          info: section.info.filter(id => id.toString().toLowerCase().slice(0, inputLength) === inputValue),
        };
      })
      .filter(section => section.info.length > 0);
    return suggestions;
  }

  getSuggestionValue = suggestion => suggestion.toString();

  handleDeviceChange = (e) => {
    if (e) e.preventDefault();
    // console.log('handleDeviceIdChange', this.state.value);
    this.submitted = true;
    if (this.state.familyCodes.findIndex(e => e.toString() === this.state.value) !== -1) {
      document.getElementById('chart-container').innerHTML = '';
      this.props.onDeviceSelected(this.state.value, 'familyCode');
      this.submitted = false;
    } else if (this.state.deviceIds.findIndex(element => element.toString() === this.state.value) !== -1) {
      document.getElementById('chart-container').innerHTML = '';
      this.props.onDeviceSelected(this.state.value, 'deviceId');
      this.submitted = false;
    }
  }

  onChange = (event, { newValue, method }) => {
    this.setState({ value: newValue });
    this.props.setSearchValue(newValue);
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
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
      placeholder: 'Enter a Family Code or Device ID',
      value,
      onChange: this.onChange,
    };
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
          onSuggestionSelected={this.handleDeviceChange}
        />
      </div>
    );
  }
}

DeviceSearch.propTypes = {
  onDeviceSelected: PropTypes.func.isRequired,
  deviceData: PropTypes.array.isRequired,
};

export default DeviceSearch;
