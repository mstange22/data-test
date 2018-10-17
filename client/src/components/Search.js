import React, { Component } from 'react';
import { Input, FormBtn } from './Form';

class Search extends Component {
  state = { topic: '' };

  handleFormSubmit = event => {
    event.preventDefault();
    const { topic } = this.state;
    if (topic) {
      this.props.onChange(topic);
    }
  };

  clearSearchForm = () => {
    this.setState({ topic: '' });
    this.props.onClearSearch();
  }

  render() {
    return(
      <div className='component-container'>
        <h1>Search</h1>
        <form>
          <Input
            id='search-input'
            value={this.state.topic}
            onChange={(evt) => this.setState({topic: evt.target.value})}
            name='topic'
            placeholder='Topic'
            autoComplete='off'
          />
          {this.state.topic === '' ? null : (
            <div>
              <FormBtn
                id='search-btn'
                disabled={!(this.state.topic)}
                onClick={this.handleFormSubmit}
                type='submit'
              >
                Search
              </FormBtn>
              <FormBtn
                id='clear-search-btn'
                disabled={!(this.state.topic)}
                onClick={this.clearSearchForm}
              >
                Clear Search
              </FormBtn>
            </div>
          )}
        </form>
      </div>
    )
  }
}

export default Search;