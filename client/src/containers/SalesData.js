import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import API from "../utils/API";
import Spinner from '../components/Spinner';
import KpiData from '../components/KpiData';

const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

class SalesData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sales: [],
      loadingData: false,
    };
  }

  componentDidMount() {
    // document.getElementById('chart-container').innerHTML = '';
    this.props.setDisplayString('Sales Data');
    this.setState({ loadingData: true });
    API.getSalesData()
      .then(res => {
          console.log('sales:', res.data);
          this.setState({
            // mediaUploads: res.data.filter(d => d.type === 'image' || d.type === 'video'),
            sales: res.data,
            loadingData: false,
          });
      })
      .catch(err => console.log(err.message));
  }

  renderSpinner = () => {
    if (!this.state.loadingData) return null;
    return (
      <Spinner height={CHART_CONTAINER_HEIGHT} width={CHART_CONTAINER_WIDTH} />
    );
  }

  render() {
    return (
      <div className="data-container">
          {this.renderSpinner()}
          <KpiData
            kpiData={this.state.sales}
          />
      </div>
    );
  }
}

SalesData.propTypes = {
  setDisplayString: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeAccounts: state.activeAccounts,
  allAccounts: state.allAccounts,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesData);
