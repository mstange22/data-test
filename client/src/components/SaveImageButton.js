import React, { Component } from 'react';

class SaveImageButton extends Component {
  state = { clicked: false }

  handleClick = () => {
    this.setState({ clicked: true });
    this.props.onClick();
    setTimeout(() => { 
      this.setState({ clicked: false })
    }, 250)
  }

  render() {
    return (
      <div
        className={!this.state.clicked ? 'save-img-btn' : 'save-img-btn-clicked'}
        onClick={this.handleClick}
      >
        {'▲'}
      </div>
    );
  }
}

export default SaveImageButton;