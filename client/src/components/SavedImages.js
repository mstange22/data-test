import React, { Component } from 'react';
import Reorder, { reorder } from 'react-reorder';
import ImgNumberBadge from './ImgNumberBadge';
import DeleteButton from './DeleteButton';
import { FormBtn } from "./Form";
import '../css/style.css';

class SavedImages extends Component {
  state = {
    savedImages: [],
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ savedImages: nextProps.savedImages })
  }

  onReorder = (event, previousIndex, nextIndex, fromId, toId) => {
    this.setState({
      savedImages: reorder(this.state.savedImages, previousIndex, nextIndex)
    });
    this.props.updateSavedImages(this.state.savedImages);
  }

  handleImageClick = (photoIndex) => {
    this.setState({
      isOpen: true,
      photoIndex,
    });
  }

  render() {
    const { savedImages } = this.state;
    console.log()
    return (
      <div className='component-container'>
        <h1>Saved Images</h1>
        {savedImages.length > 0 ? (
          <div>
            <div className='images-container'>
              <Reorder
                reorderId="saved-images" // Unique ID that is used internally to track this list (required)
                holdTime={0} // Default hold time before dragging begins (mouse & touch) (optional), defaults to 0
                onReorder={this.onReorder.bind(this)} // Callback when an item is dropped (you will need this to update your state)
              >
                {
                  savedImages.map((i, index) => (
                    <div className='img-container' key={index}>
                      <img
                        src={i.thumbnailUrl}
                        key={index}
                        alt={i.name}
                        id='saved-img'
                        onClick={() => this.handleImageClick(index)}
                      />
                      <ImgNumberBadge number={index + 1} />
                      <DeleteButton onClick={() => this.props.onDelete(i)} />
                    </div>
                  ))
                }
              </Reorder>
            </div>
            <FormBtn
              id='create-story-btn'
              onClick={this.props.onCreateStory}
            >
              Create Story
            </FormBtn>
            <FormBtn
              id='clear-images-btn'
              onClick={this.props.onClearImages}
            >
              Clear Images
            </FormBtn>
          </div>
        ) : (
          <h3>No Saved Images</h3>
        )}
      </div>
    );
  }
}

export default SavedImages;