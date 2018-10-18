import React from 'react';

const DataHeader = (props) => {
  const { displayString } = props;
  return (
    <div>
      <h2>
        <span>{displayString}</span>
      </h2>
    </div>
  );
}

export default DataHeader;
