import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
{{#if redux}}
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import reducers from './redux/reducers';
{{/if}}
import 'babel-polyfill';

import App from './components/App';

import './styles/app.scss';

ReactDOM.render(
{{#if redux}}
<Provider store={createStore(reducers)}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Provider>,
{{else}}
<BrowserRouter>
  <App />
</BrowserRouter>,
{{/if}}
document.getElementById('root') as HTMLElement);