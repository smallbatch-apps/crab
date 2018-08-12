import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import 'babel-polyfill';

import App from './components/App';

import './styles/app.scss';

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, 
  document.getElementById('root'));