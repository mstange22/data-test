import React, { Component } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
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
        <Navbar />
        <Sidebar
          showWatchData={() => this.setState({ displayMode: 'watch'})}
          showMediaUploads={() => this.setState({ displayMode: 'media_uploads'})}
          showEmotionData={() => this.setState({ displayMode: 'emotion'})}
          showSmsData={() => this.setState({ displayMode: 'sms'})}
        />
        <div className="content-container">
          <DataDisplay
            displayMode={this.state.displayMode}
          />
        </div>
      </div>
    )
  }
}

export default Main;
