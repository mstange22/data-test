import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import Lightbox from 'react-image-lightbox';
import SaveImageButton from './SaveImageButton';
import SaveImageButtonLightbox from './SaveImageButtonLightbox';

class SearchResults extends Component {
  state = {
    newImages: [],
    pageCount: 6,
    offset: 0,
    photoIndex: 0,
    isOpen: false,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ newImages: nextProps.newImages });
  }

  handlePageClick = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * 25);

    this.setState({offset: offset});
    this.props.onPaginate(offset);
  }

  handleSaveImage = (image) => {
    this.props.onSaveImage(image);
  }

  handleImageClick = (photoIndex) => {
    this.setState({
      isOpen: true,
      photoIndex,
    });
  }

  render() {
    const { newImages, isOpen, photoIndex } = this.state;

    return (
      <div className='component-container'>
        <h1>Search Results{newImages.length ? `: "${this.props.topic}"` : null}</h1>
        {newImages.length > 0 ? (
          <div className='images-container'>
            <div id='search-results-controls'>
              <ReactPaginate
                previousLabel={'<'}
                nextLabel={">"}
                breakLabel={<a href="">...</a>}
                breakClassName={'break-me'}
                pageCount={this.state.pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={this.handlePageClick}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}            
              />
            </div>
            {newImages.map((i, index) => (
              <div
                key={i.imageId}
                className='img-container'
              >
                <img
                  id='results-img'
                  key={i.imageId}
                  src={i.thumbnailUrl}
                  alt={i.name}
                  onClick={() => this.handleImageClick(index)}
                />
                <SaveImageButton onClick={() => this.handleSaveImage(i)} />
              </div>
            ))}
          </div>
        ) : (
          <h3>No Results to Display</h3>
        )}
        { isOpen && (
          <div className='lightbox-container'>
          <Lightbox
            mainSrc={this.state.newImages[this.state.photoIndex].contentUrl}
            nextSrc={newImages[(photoIndex + 1) % newImages.length].contentUrl}
            prevSrc={newImages[(photoIndex + newImages.length - 1) % newImages.length].contentUrl}
            onCloseRequest={() => this.setState({ isOpen: false })}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex: (photoIndex + newImages.length - 1) % newImages.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % newImages.length,
              })
            }
          />
          <SaveImageButtonLightbox
            className='save-img-btn-lightbox'
            onClick={() => this.handleSaveImage(newImages[photoIndex])}
          />
          </div>
        ) }
      </div>
    );
  }
}

export default SearchResults;