import './sidebar.css';
import { useEffect, useState } from 'react';
import { Message, vsCodeData } from '../../globals/types';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql';
import { GraphQLService } from '../services/GraphQLService';
import { useCombobox } from 'downshift';
import { Table } from './Table';
import { VSCodeService } from '../services/VSCodeService';

interface Repo {
  name: string;
  description?: string;
  url: string;
  updatedAt: Date;
}

export const Sidebar = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [trackedRepos, setTrackedRepos] = useState<Repo[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    setInputValue,
    getItemProps,
  } = useCombobox({
    items: filteredItems,
    onInputValueChange: ({ inputValue }) => {
      if (!inputValue) {
        return;
      }
      setFilteredItems(
        repos
          .filter((repo) => {
            if (
              trackedRepos
                .map((trackedRepo) => trackedRepo.name.toLowerCase())
                .includes(repo.name.toLowerCase())
            ) {
              return false;
            }
            if (
              repo.name.toLowerCase().includes(inputValue?.toLowerCase()) ||
              repo.name
                .replace('-', ' ')
                .toLowerCase()
                .includes(inputValue?.toLowerCase())
            ) {
              return true;
            }
          })
          .map((repo) => repo.name),
      );
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) {
        return;
      }
      const repo = findRepoByName(selectedItem);
      if (!repo) {
        return;
      }
      setInputValue('');
      if (!trackedRepos.includes(repo)) {
        setTrackedRepos([...trackedRepos, repo]);
      }
    },
  });

  let accessToken: string | undefined;
  let client: GraphQLClient | undefined;

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
    console.log(userRepos);
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message: vsCodeData = event.data;
      switch (message.type) {
        case Message.addRepo:
          console.log(message);
          break;
        case Message.getToken:
          accessToken = message.value;
          setAuthenticated(true);
          client = new GraphQLService(accessToken).client;
          (async () => {
            await fetchUserRepos();
          })();
      }
    });

    VSCodeService.sendMessage(Message.getToken);
  }, []);

  const findRepoByName = (name: string): Repo | undefined => {
    return repos.find((repo) => repo.name === name);
  };

  const onTrackedRepoClick = (clickedRepo: Repo) => {
    setTrackedRepos(trackedRepos.filter((repo) => repo !== clickedRepo));
  };

  const onRecordClick = ({ name }: { name: string; track: JSX.Element }) => {
    const repo = repos.find(
      (repo) => repo.name.toLowerCase() === name.toLowerCase(),
    );
    if (!repo) {
      return;
    }
    VSCodeService.sendMessage(Message.openBrowser, `${repo.url}/pulls`);
  };

  return (
    <>
      <h1>PR Finder</h1>
      {!isAuthenticated && <button>Login</button>}
      {repos.length > 0 && (
        <div>
          <label {...getLabelProps()}>Select a repo to track</label>
          <div className="input-wrapper" {...getComboboxProps()}>
            <input {...getInputProps()} style={{ width: '80%' }} />
            <button
              type="button"
              {...getToggleButtonProps()}
              aria-label="toggle menu"
              style={{
                width: '20%',
              }}
            >
              &#8595;
            </button>
          </div>
          <ul
            {...getMenuProps()}
            style={{
              maxHeight: 80,
              maxWidth: 300,
              overflowY: 'scroll',
              backgroundColor: 'var(--vscode-button-secondaryBackground)',
              color: 'var(--vscode-button-secondaryForeground)',
              padding: 0,
              listStyle: 'none',
              position: 'relative',
            }}
          >
            {isOpen &&
              filteredItems.map((item, index) => (
                <li
                  style={
                    highlightedIndex === index
                      ? { backgroundColor: '#bde4ff' }
                      : {}
                  }
                  key={`${item}${index}`}
                  {...getItemProps({ item, index })}
                >
                  {item}
                </li>
              ))}
          </ul>
          {trackedRepos.length > 0 && (
            <>
              <h3>Tracked repos</h3>
              <Table
                records={trackedRepos.map((repo) => ({
                  name: repo.name,
                  track: (
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={() => onTrackedRepoClick(repo)}
                    />
                  ),
                }))}
                onRecordClick={onRecordClick}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};
