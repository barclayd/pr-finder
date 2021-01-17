import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql';
import { useEffect, useState } from 'react';
import { Message, VSCodeData } from '../../globals/types';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Sidebar } from './Sidebar';

export interface Repo {
  name: string;
  description?: string;
  url: string;
  updatedAt: Date;
}

export const SidebarContainer = () => {
  let client: GraphQLClient | undefined;
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: VSCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getToken:
          setAccessToken(message.value);
          client = new GraphQLService(message.value).client;
          (async () => {
            await fetchUserRepos();
          })();
      }
    });

    VSCodeService.sendMessage(Message.getToken);
  }, []);

  const fetchUserRepos = async () => {
    if (!client) {
      return;
    }
    const sdk = getSdk(client);

    let hasRetrievedAllUserRepos = false;
    let endCursor: string | null | undefined;
    const userRepos: Repo[] = [];
    while (!hasRetrievedAllUserRepos) {
      const {
        viewer: {
          repositories: { pageInfo, nodes },
        },
      } = await sdk.UserRepo({
        startCursor: endCursor,
      });
      endCursor = pageInfo.endCursor;
      if (nodes) {
        const repos = nodes
          .filter((node) => node !== undefined && node !== null)
          .map<Repo>((node) => ({
            name: node!.name,
            description: node?.description ?? '',
            url: node!.url,
            updatedAt: new Date(node!.updatedAt),
          }));
        userRepos.push(...repos);
      }
      if (!pageInfo.hasNextPage) {
        hasRetrievedAllUserRepos = true;
      }
    }
    const reposSortedByTime = userRepos.sort(
      (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
    );
    setRepos(
      userRepos.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    );
    setFilteredItems(reposSortedByTime.map((repo) => repo.name));
  };

  if (repos.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <Sidebar
      filteredItems={filteredItems}
      repos={repos}
      accessToken={accessToken}
      setFilteredItems={setFilteredItems}
    />
  );
};
