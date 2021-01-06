import './sidebar.css';
import { useEffect } from 'react';
import { vsCodeData } from '../types';

export const Sidebar = () => {

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: vsCodeData = event.data;
      switch (message.type) {
        case 'add-repo':
          console.log(message);
      }
    });
  }, []);



  return (
    <>
      <h1>PR Finder</h1>
      <button>Login</button>
    </>
  );
};
