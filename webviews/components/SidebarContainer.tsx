import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import { Message, VSCodeData } from '../../globals/types';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Sidebar } from './Sidebar';
import { GithubUser } from '../types';

export const SidebarContainer = () => {
  let client: GraphQLClient | undefined;
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [githubUsername, setGithubUsername] = useState<string | undefined>();

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: VSCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getGithubUser:
          console.log(message);
          const { user, token }: GithubUser = message.value;
          setAccessToken(token);
          setGithubUsername(user);
          client = new GraphQLService(message.value).client;
      }
    });

    VSCodeService.sendMessage(Message.getGithubUser);
  }, []);

  if (!accessToken || !githubUsername) {
    return <div>Loading...</div>;
  }
  return <Sidebar accessToken={accessToken} username={githubUsername} />;
};
