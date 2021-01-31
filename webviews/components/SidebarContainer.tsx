import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import { Message, VSCodeData } from '../../globals/types';
import { AuthContext, defaultAuth } from '../contexts/AuthContext';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Auth, AuthValue, GithubUser } from '../types';
import { Sidebar } from './Sidebar';

export const SidebarContainer = () => {
  let client: GraphQLClient | undefined;
  const [authState, setRawAuthState] = useState<Auth>(defaultAuth);
  const { accessToken, githubUsername, userOnServerStatus } = authState;

  const setAuthState = (newState: AuthValue) => {
    setRawAuthState({
      ...authState,
      ...newState,
    });
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: VSCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getGithubUser:
          const { user, token }: GithubUser = message.value;
          if (!token || !user) {
            setAuthState({
              userOnServerStatus: 'notFound',
            });
            return;
          }
          setAuthState({
            accessToken: token,
            githubUsername: user,
            userOnServerStatus: 'found',
          });
          client = new GraphQLService(message.value).client;
      }
    });

    VSCodeService.sendMessage(Message.getGithubUser);
  }, []);

  const onLoginClick = () => {
    VSCodeService.sendMessage(Message.onLogin);
  };

  const isNoUser = !accessToken || !githubUsername;

  if (isNoUser && userOnServerStatus === 'fetching') {
    return <div>Loading...</div>;
  }
  if (!accessToken || !githubUsername) {
    return <button onClick={onLoginClick}>Login with Github</button>;
  }
  return (
    <AuthContext.Provider
      value={{ accessToken: githubUsername, userOnServerStatus, setAuthState }}
    >
      <Sidebar accessToken={accessToken} username={githubUsername} />
    </AuthContext.Provider>
  );
};
