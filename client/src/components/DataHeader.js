import React from 'react';
import PropTypes from 'prop-types';

const DataHeader = (props) => {
  const { displayString } = props;
  return (
    <div className="data-header-container">
      <h2>
        <span>{displayString}</span>
      </h2>
    </div>
  );
};

DataHeader.propTypes = {
  displayString: PropTypes.string.isRequired,
};

export default DataHeader;
