import React, { Component } from 'react';
import API from './utils/API';
// import createStory from './utils/StoryCreator';
import SavedImages from './components/SavedImages';
import Search from './components/Search';
import SearchResults from './components/SearchResults';
import StoryTitle from './components/StoryTitle';

class Images extends Component {
  state = {
    newImages: [],
    savedImages: [],
    storyTitle: '',
    topic: '',
    offset: 0,
  };

  onSaveImage = (image) => {
    // remove image from SearchResults & add to SavedImages
    this.setState({ savedImages: [ ...this.state.savedImages, image ] });
  }

  search = () => {
    const { topic, offset } = this.state;
    API.searchBing(topic, offset)
    .then((result) => this.setState({newImages: JSON.parse(result.data).value}))
    .catch(err => console.log(err.message));
  }

  onPaginate = (offset) => {
    this.setState({offset}, () => {
      this.search();
    });
  }

  onChangeQuery = (topic) => {
    this.setState({topic, offset:0}, () => {
      this.search();
    });
  }

  onDelete = (image) => {
    const index = this.state.savedImages.indexOf(image);
    const tempImgArr = this.state.savedImages;
    tempImgArr.splice(index, 1);
    this.setState({ savedImages: tempImgArr });
  }

  onClearImages = () => {
    this.setState({ savedImages: [] });
  }

  onClearSearch = () => {
    this.setState({
      newImages: [],
      topic: '',
    });
  }

  updateStoryTitle = (title) => {
    this.setState({ storyTitle: title });
  }

  updateSavedImages = (savedImages) => {
    this.setState({ savedImages });
  }

  onCreateStory = () => {
    const { storyTitle, savedImages } = this.state;
    console.log('create story button click');
    console.log('Story Title:', storyTitle);
    console.log('Saved Images:', savedImages);
    // createStory(savedImages, storyTitle);
  }

  render() {
    // console.log('savedImages at the root', this.state.savedImages);
    return (
      <div>
        <StoryTitle
          storyTitle={this.state.storyTitle}
          updateStoryTitle={this.updateStoryTitle} />
        <SavedImages
          savedImages={this.state.savedImages}
          onDelete={this.onDelete}
          onClearImages={this.onClearImages}
          onCreateStory={this.onCreateStory}
          updateSavedImages={this.updateSavedImages}
        />
        <Search
          onChange={ this.onChangeQuery }
          onClearSearch={this.onClearSearch}
        />
        <SearchResults
          newImages={this.state.newImages}
          onPaginate={ (offset) => this.onPaginate(offset) }
          onSaveImage={ (image) => { this.onSaveImage(image) }}
          topic={this.state.topic}
        />
      </div>
    );
  }
}

export default Images;
