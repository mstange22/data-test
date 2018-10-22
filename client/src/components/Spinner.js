import React from 'react';
import { ClipLoader } from 'react-spinners';

const Spinner = (props) => {
  return (
    <div style={{ display: 'flex', paddingTop: 100, justifyContent: 'center', height: props.height, width: props.width }}>
      <ClipLoader size={36} color="#57337e" />
    </div>
  );
}

export default Spinner;