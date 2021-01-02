import './sidebar.css';
import { useEffect, useState } from 'react';
import { vsCodeData } from '../types';

export const Sidebar = () => {
  const [input, setInput] = useState('');

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: vsCodeData = event.data;
      console.log({ message });
      switch (message.type) {
        case 'add-repo':
          setInput(message.value);
      }
    });
  }, []);

  return (
    <>
      <h1>PR Finder</h1>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <div>{input}</div>
      <button onClick={() => setInput('')}>Reset</button>
      <button
        onClick={() => {
          tsVscode.postMessage({
            type: 'onInfo',
            value: 'info message',
          });
        }}
      >
        Info
      </button>
      <button
        onClick={() => {
          tsVscode.postMessage({
            type: 'onError',
            value: 'info message',
          });
        }}
      >
        Error
      </button>
    </>
  );
};
