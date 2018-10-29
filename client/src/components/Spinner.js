import React from 'react';
import { ClipLoader } from 'react-spinners';

const CHART_CONTAINER_HEIGHT = window.innerHeight - 580;
const CHART_CONTAINER_WIDTH = window.innerWidth - 280;

const Spinner = (props) => {
  return (
    <div style={{ display: 'flex', paddingTop: 100, justifyContent: 'center', height: CHART_CONTAINER_HEIGHT, width: CHART_CONTAINER_WIDTH }}>
      <ClipLoader size={36} color="#57337e" />
    </div>
  );
}

export default Spinner;