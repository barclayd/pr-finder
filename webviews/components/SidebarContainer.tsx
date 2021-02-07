import { GraphQLClient } from 'graphql-request';
import { useEffect } from 'react';
import { Message, Settings, User, VSCodeData } from '../../globals/types';
import { AuthContext, defaultAuth } from '../contexts/AuthContext';
import { defaultSettings, SettingsContext } from '../contexts/SettingsContext';
import { usePartialState } from '../hooks/usePartialState';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Sidebar } from './Sidebar';

export const SidebarContainer = () => {
  let client: GraphQLClient | undefined;
  const [
    { accessToken, userOnServerStatus, githubUsername },
    setAuthState,
  ] = usePartialState(defaultAuth);
  const [
    { showDrafts, showNotifications, refreshTime },
    setSettingsState,
  ] = usePartialState(defaultSettings);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: VSCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getUser:
          const user: User = message.value;
          if (!user) {
            setAuthState({
              userOnServerStatus: 'notFound',
            });
            return;
          }
          setAuthState({
            accessToken: user.accessToken,
            githubUsername: user.username,
            userOnServerStatus: 'found',
          });
          client = new GraphQLService(message.value).client;
          break;
        case Message.getSettings:
          const settings: Settings = message.value;
          setSettingsState(settings);
          break;
      }
    });

    VSCodeService.sendMessage(Message.getUser);
    VSCodeService.sendMessage(Message.getSettings);
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
      value={{
        accessToken,
        githubUsername,
        userOnServerStatus,
        setState: setAuthState,
      }}
    >
      <SettingsContext.Provider
        value={{
          showNotifications,
          showDrafts,
          refreshTime,
          setState: setSettingsState,
        }}
      >
        <Sidebar accessToken={accessToken} username={githubUsername} />
      </SettingsContext.Provider>
    </AuthContext.Provider>
  );
};
