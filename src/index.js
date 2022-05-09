import './index.less';

import React from 'react';
import ReactDOM from 'react-dom';
import { interpret } from 'xstate';

import { App } from './App';
import { AppMachine } from './machines/AppMachine';
import reportWebVitals from './reportWebVitals';


ReactDOM.render(
    <React.StrictMode>
        <App actor={interpret(AppMachine).start(/*JSON.parse(localStorage.getItem("lastState")) || AppMachine.initialState*/)} />
    </React.StrictMode>,
    document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
