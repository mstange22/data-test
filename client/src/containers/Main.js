import React, { Component } from "react";
import Sidebar from '../components/Sidebar';
import DataTest from '../components/DataTest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      displayMode: '',
      displayString: '',
    };
  }

  renderDataHeader = () => {
    const { displayString } = this.state;
    return (
      <div>
        <h2>
          {displayString === '' ? (
            <span>
              <FontAwesomeIcon icon="arrow-left" />
              {' Choose a graph in the sidebar'}
            </span>
          ) : (
            <span>{displayString}</span>
          )}
        </h2>
      </div>
    )
  }

  render() {
    return (
      <div className="page-container">
        <div id="navbar">
          <img
            className="navbar-logo"
            src={require('../assets/images/reminx-logo.png')}
            alt="ReminX Logo"
            width={250}
          />
        </div>
        <Sidebar
          showWatchData={() => this.setState({ displayMode: 'watch'})}
          showMediaUploads={() => this.setState({ displayMode: 'media_uploads'})}
          showEmotionData={() => this.setState({ displayMode: 'emotion'})}
        />
        <div className="content-container">
          <h3 className="rx-header-title">ReminX Data Portal</h3>
          <div className="data-container">
            {this.renderDataHeader()}
            <div id="chart-container" />
          </div>
          <DataTest
            displayMode={this.state.displayMode}
            setDisplayString={displayString => this.setState({ displayString })}
          />
        </div>
      </div>
    )
  }
}

export default Main;
