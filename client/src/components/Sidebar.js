import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
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
              <div className="sidebar-header">
                <span>Main Menu</span>
              </div>
              <div>
                <img
                  className="sidebar-avatar"
                  alt="Loved One's avatar"
                  src={require('../assets/images/bar-graph.png')}
                  onClick={this.props.onEditLovedOne}
                  role="link"
                />
              </div>
              <div
                className="sidebar-name"
              >
                Chose a graph:
              </div>
            </div>
          </li>
          <li>
            <NavLink to="/" onClick={this.props.showWatchData}>Watch Minutes</NavLink>
          </li>
          <li>
            <NavLink to="/uploads" onClick={this.props.showMediaUploads}>
              <span>Media Uploads</span>
            </NavLink>
          </li>
          <li><NavLink to="/participants" onClick={this.props.showEmotionData}>Emotion</NavLink></li>
        </ul>
      </div>
    );
  }
}

Sidebar.propTypes = {
  showWatchData: PropTypes.func.isRequired,
  showEmotionData: PropTypes.func.isRequired,
  showMediaUploads: PropTypes.func.isRequired,
  // toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
