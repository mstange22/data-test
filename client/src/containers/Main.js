import React, { Component } from "react";
import { connect } from 'react-redux';
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
        <Sidebar handleSidebarClick={(displayMode) => this.setState({displayMode})} />
        <div className="content-container">
          <DataDisplay
            displayMode={this.state.displayMode}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
