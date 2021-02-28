import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import { Message, Settings, User, VSCodeData } from '../../globals/types';
import { AuthContext, defaultAuth } from '../contexts/AuthContext';
import { defaultSettings, SettingsContext } from '../contexts/SettingsContext';
import { usePartialState } from '../hooks/usePartialState';
import { GraphQLService } from '../services/GraphQLService';
import { NetworkService } from '../services/NetworkService';
import { VSCodeService } from '../services/VSCodeService';
import { GithubSearchRepo } from '../types';
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
  const [initialTrackedRepos, setInitialTrackedRepos] = useState<
    GithubSearchRepo[]
  >([]);
  const [didFetchTrackedRepos, setDidFetchTrackedRepos] = useState(false);

  useEffect(() => {
    let localUserData: { accessToken?: string; githubUsername?: string } = {
      accessToken: undefined,
      githubUsername: undefined,
    };
    window.addEventListener('message', async (event) => {
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
          localUserData.accessToken = user.accessToken;
          localUserData.githubUsername = user.username;
          setAuthState({
            accessToken: user.accessToken,
            githubUsername: user.username,
            userOnServerStatus: 'found',
          });
          client = new GraphQLService(message.value).client;
          VSCodeService.sendMessage(Message.getTrackedRepos);
          break;
        case Message.getSettings:
          const settings: Settings = message.value;
          setSettingsState(settings);
          break;
        case Message.getTrackedRepos:
          const trackedRepos = message.value as GithubSearchRepo[] | undefined;
          if (!trackedRepos || trackedRepos.length === 0) {
            break;
          }
          const networkService = new NetworkService(localUserData.accessToken);
          const validatedRepos = (await Promise.all(
            trackedRepos
              .map(async (repo) => {
                const searchUrl = `https://api.github.com/repos/${
                  repo.organisation ?? localUserData.githubUsername
                }/${repo.name}`;
                const { status } = await networkService.get(searchUrl);
                return status === 200 ? repo : undefined;
              })
              .filter(Boolean),
          )) as GithubSearchRepo[];
          setInitialTrackedRepos(validatedRepos);
          setDidFetchTrackedRepos(true);
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
  if (!didFetchTrackedRepos) {
    return <div>Fetching repo data...</div>;
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
        <Sidebar
          accessToken={accessToken}
          username={githubUsername}
          initialTrackedRepos={initialTrackedRepos}
        />
      </SettingsContext.Provider>
    </AuthContext.Provider>
  );
};
