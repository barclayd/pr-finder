import './sidebar.css';
import { useState } from 'react';

export const Sidebar = () => {
  const [input, setInput] = useState('');
  return (
    <>
      <h1>PR Finder</h1>
      <input type="text" value={input} onChange={(event) => setInput(event.target.value)}/>
      <div>{input}</div>
      <button onClick={() => setInput('')}>Reset</button>
      <button onClick={() => {
        tsvscode.postMessage({
          type: 'onInfo',
          value: 'info message',
        });
      }}>Info</button>
      <button onClick={() => {
        tsvscode.postMessage({
          type: 'onError',
          value: 'info message',
        });
      }}>Error</button>
    </>
  );
};
