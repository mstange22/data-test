import React, { Component } from 'react';

class DeleteButton extends Component {
  render() {
    return (
      <div
        className='delete-button'
        onClick={this.props.onClick}
      >
        {'✗'}
      </div>
    );
  }
}

export default DeleteButton;