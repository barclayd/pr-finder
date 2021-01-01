import React from 'react';
import ReactDOM from 'react-dom';
import { HelloWorld } from '../components/HelloWorld';

export function render() {
  ReactDOM.render(
    <React.StrictMode>
      <HelloWorld />
    </React.StrictMode>,
    document.getElementById('root'),
  );
}
