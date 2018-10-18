import React, { Component } from "react";
import Sidebar from '../components/Sidebar';
import DataDisplay from './DataDisplay';
import '../css/style.css';
import 'muze/dist/muze.css';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      displayMode: '',
    };
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
          <h3 className="rx-header-title">Data Pipeline Dashboard</h3>
          <div className="data-container">
            <DataDisplay
              displayMode={this.state.displayMode}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Main;
