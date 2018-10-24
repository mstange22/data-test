import React, { Component } from 'react';

class Navbar extends Component {
  render() {
    return (
      <div id="navbar">
        <img
          className="navbar-logo"
          src={require('../assets/images/reminx-logo.png')}
          alt="ReminX Logo"
          width={250}
        />
        <div className="navbar-container-right">
          <h3 className="rx-header-title">Data Pipeline Dashboard</h3>
          <img
            className="sidebar-avatar"
            alt="Bar Graph"
            src={require('../assets/images/bar-graph.png')}
          />
        </div>
      </div>
    );
  }
}

export default Navbar;
