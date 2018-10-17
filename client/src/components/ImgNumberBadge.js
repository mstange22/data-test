import React, { Component } from 'react';

class ImgNumberBadge extends Component {
  render() {
    const { number } = this.props;
    return (
      <div className='img-number-badge'>
        {number}
      </div>
    );
  }
}

export default ImgNumberBadge;