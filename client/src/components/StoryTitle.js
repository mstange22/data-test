import React, { Component } from 'react';
import { Input, FormBtn } from './Form';

class StoryTitle extends Component {
  state = {
    storyTitle: this.props.storyTitle,
    isTitleUpdated: false,
    isEditingTitle: false,
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleFormSubmit = event => {
    event.preventDefault();

    if (this.state.storyTitle) {
      this.props.updateStoryTitle(this.state.storyTitle);
    }

    // clear out input forms on submit
    this.setState({
      isTitleUpdated: true,
      isEditingTitle: false,
    });
  };

  editTitle = () => {
    this.setState({ isEditingTitle: true });
  }

  render() {
    const { isTitleUpdated, isEditingTitle } = this.state;
    return(
      <div
        className='component-container'
        id='story-title-component'
      >
        { !isTitleUpdated || isEditingTitle ? (
          <form>
            <Input
            id='story-title-input'
            value={this.state.storyTitle}
            onChange={this.handleInputChange}
            name='storyTitle'
            autoComplete='off'
            placeholder='Story Title'
            />
            {this.state.storyTitle === '' ? null : (
              <FormBtn
                id='update-story-title-btn'
                disabled={!(this.state.storyTitle)}
                onClick={this.handleFormSubmit}
              >
                Update Story Title
              </FormBtn>
            )}
          </form>
        ) : (
          <h1
            id='story-title-header'
            onClick={this.editTitle}>
            {this.props.storyTitle}
          </h1>
        )}
      </div>
    )
  }
}

export default StoryTitle;