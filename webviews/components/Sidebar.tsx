import './sidebar.css';
import { useEffect } from 'react';
import { Message, vsCodeData } from '../../globals/types';

export const Sidebar = () => {
  let accessToken: string | undefined;

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: vsCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getToken:
          accessToken = message.value;
          console.log(accessToken);
      }
    });

    tsVscode.postMessage({
      type: Message.getToken,
      value: '',
    });
  }, []);

  return (
    <>
      <h1>PR Finder</h1>
      <button>Login</button>
    </>
  );
};
