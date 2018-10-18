import React from "react";
import Main from './containers/Main';
import { library } from '@fortawesome/fontawesome-svg-core';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

library.add(faArrowLeft);

const App = () => <Main />;

export default App;
