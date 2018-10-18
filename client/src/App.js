import React from "react";
import Main from './containers/Main';
import { library } from '@fortawesome/fontawesome-svg-core';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartBar } from '@fortawesome/free-solid-svg-icons'

library.add(faArrowLeft, faChartBar);

const App = () => <Main />;

export default App;
