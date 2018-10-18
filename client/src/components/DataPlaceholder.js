import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class DataPlaceholder extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div className="data-placeholder-container">
        Choose a graph from the sidebar
        <div className="data-placeholder-icon-container">
          <FontAwesomeIcon icon="chart-bar" />
        </div>
      </div>
    );
  }
}

export default DataPlaceholder;