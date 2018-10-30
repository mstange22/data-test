import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

const CHART_CONTAINER_HEIGHT = window.innerHeight - 760;
const CHART_CONTAINER_WIDTH = window.innerWidth - 310;

const Spinner = props => {
  if (!props.loading) return null;
  return (
    <div style={{ display: 'flex', paddingTop: 100, justifyContent: 'center', height: CHART_CONTAINER_HEIGHT, width: CHART_CONTAINER_WIDTH }}>
      <ClipLoader size={36} color="#57337e" />
    </div>
  );
};

Spinner.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default Spinner;