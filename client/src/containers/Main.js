import React, { Component } from "react";
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DataDisplay from './DataDisplay';
import { setState } from '../redux/actions';
import '../css/style.css';
import 'muze/dist/muze.css';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      displayMode: '',
    };
  }

  componentDidMount() {
    console.log('state:', this.props.state);
    this.props.setState({ greeting: 'hello world'});
  }

  componentDidUpdate(prevProps) {
    if (this.props.state !== prevProps.state) {
      console.log('newState:', this.props.state);
    }
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

const mapStateToProps = (state) => ({
  state,
});

const mapDispatchToProps = {
  setState,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
