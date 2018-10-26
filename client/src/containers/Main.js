import React, { Component } from "react";
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DataDisplay from './DataDisplay';
import API from '../utils/API';
import { setAllAccounts, setActiveAccounts } from '../redux/actions';
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
    this.getAccounts();
  }

  getAccounts = () => {
    API.getAllAccounts()
      .then(res => {
        console.log('all accounts res:', res.data);
        this.props.setAllAccounts(res.data);
      })
      .catch(err => console.log(err.message));
    API.getActiveWatcherAccounts()
      .then(res => {
        console.log('active customer accounts res:', res.data);
        this.props.setActiveAccounts(res.data);
      })
      .catch(err => console.log(err.message));
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
  setAllAccounts,
  setActiveAccounts,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
