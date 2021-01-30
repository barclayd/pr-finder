import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import { Message, VSCodeData } from '../../globals/types';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Sidebar } from './Sidebar';
import { GithubUser } from '../types';

type UserOnServer = 'fetching' | 'found' | 'notFound';

export const SidebarContainer = () => {
  let client: GraphQLClient | undefined;
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [userOnServer, setUserOnServerStatus] = useState<UserOnServer>(
    'fetching',
  );
  const [githubUsername, setGithubUsername] = useState<string | undefined>();

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: VSCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getGithubUser:
          const { user, token }: GithubUser = message.value;
          setAccessToken(token);
          setGithubUsername(user);
          if (!token || !user) {
            setUserOnServerStatus('notFound');
            return;
          }
          setUserOnServerStatus('found');
          client = new GraphQLService(message.value).client;
      }
    });

    VSCodeService.sendMessage(Message.getGithubUser);
  }, []);

  const onLoginClick = () => {
    VSCodeService.sendMessage(Message.onLogin);
  };

  if (!accessToken || (!githubUsername && userOnServer === 'fetching')) {
    return <div>Loading...</div>;
  }
  if (!accessToken || !githubUsername || userOnServer === 'notFound') {
    return <button onClick={onLoginClick}>Login with Github</button>;
  }
  return <Sidebar accessToken={accessToken} username={githubUsername} />;
};
