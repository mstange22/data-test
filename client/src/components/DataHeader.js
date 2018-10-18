import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DataHeader = (props) => {
  const { displayString } = props;
  return (
    <div>
      <h2>
        {displayString === '' ? (
          <span>
            <FontAwesomeIcon icon="arrow-left" />
            {' Choose a graph in the sidebar'}
          </span>
        ) : (
          <span>{displayString}</span>
        )}
      </h2>
    </div>
  );
}

export default DataHeader;
