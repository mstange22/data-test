import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Notification = props =>
  <div className="notification-container">
    <h2>Error!</h2>
    { props.errorMessage }
    <br />
    <br />
    <Button
      bsStyle="default"
      onClick={props.onCloseNotification}
      type="submit"
    >
      OK
    </Button>
  </div>
;

Notification.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  onCloseNotification: PropTypes.func.isRequired,
};

export default Notification;