import './sidebar.css';
import { useEffect, useState } from 'react';
import { Message, vsCodeData } from '../../globals/types';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql';
import { GraphQLService } from '../services/GraphQLService';
import { useCombobox } from 'downshift';

interface Repo {
  name: string;
  description?: string;
  url: string;
  updatedAt: Date;
}

export const Sidebar = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: filteredItems,
    onInputValueChange: ({ inputValue }) => {
      if (!inputValue) {
        return;
      }
      setFilteredItems(
        repos
          .filter((repo) =>
            repo.name.toLowerCase().includes(inputValue?.toLowerCase()),
          )
          .map((repo) => repo.name),
      );
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
      userRepos.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()),
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
          client = new GraphQLService(accessToken).client;
          (async () => {
            await fetchUserRepos();
          })();
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
      <label {...getLabelProps()}>Choose an element:</label>
      <div
        style={{ display: 'inline-block', marginLeft: '5px' }}
        {...getComboboxProps()}
      >
        <input {...getInputProps()} />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
          style={{
            width: '25%',
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
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </li>
          ))}
      </ul>
    </>
  );
};
