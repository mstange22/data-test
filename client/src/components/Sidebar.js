import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { connect } from 'react-redux';
// import { toggleSidebar } from '../../modules/Album/albumActions';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  toggleSidebar = () => {
    if (window.innerWidth > 768) {
      return;
    }
    // const sidebar = document.getElementById('sidebar-wrapper');
    // if (!this.props.showSidebar) {
    //   sidebar.classList.add('toggle');
    // } else if (sidebar.classList) {
    //   sidebar.classList.remove('toggle');
    // }
    // this.props.toggleSidebar();
  }

  render() {
    return (
      <div id="sidebar-wrapper">
        <ul className="sidebar-nav">
          <li>
            <div className="sidebar-loved-one">
              {/* <div className="sidebar-header">
                <span>Main Menu</span>
              </div> */}
              <div className="sidebar-img-container">
                {/* <div className="sidebar-graph">
                  <FontAwesomeIcon icon="chart-bar" />
                </div> */}
                <img
                  className="sidebar-avatar"
                  alt="Bar Graph"
                  src={require('../assets/images/rx.png')}
                  // src={require('../assets/images/bar-graph.png')}
                />
              </div>
              {/* <div
                className="sidebar-name"
              >
                Chose a graph:
              </div> */}
            </div>
          </li>
          <li><a onClick={() => this.props.handleSidebarClick('watch')}>Watch</a></li>
          <li><a onClick={() => this.props.handleSidebarClick('media')}>Media</a></li>
          <li><a onClick={() => this.props.handleSidebarClick('emotion')}>Emotion</a></li>
          <li><a onClick={() => this.props.handleSidebarClick('sms')}>SMS</a></li>
          <li><a onClick={() => this.props.handleSidebarClick('device')}>Device</a></li>
          <li><a onClick={() => this.props.handleSidebarClick('music')}>Music</a></li>
          <li><a onClick={() => this.props.handleSidebarClick('sales')}>Sales</a></li>
        </ul>
      </div>
    );
  }
}

Sidebar.propTypes = {
  handleSidebarClick: PropTypes.func.isRequired,
  // toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
