import { FC, useEffect, useRef, useState } from 'react';
import { Message, NewPullRequest } from '../../globals/types';
import { useCombobox } from 'downshift';
import { Table } from './Table';
import { VSCodeService } from '../services/VSCodeService';
import { PRList } from './PRList';
import { Accordion } from './Accordion';
import { SearchIcon } from './icons/Search';
import { TrashIcon } from './icons/Trash';
import '../styles/sidebar.css';
import { usePrevious } from '../hooks/usePrevious';
import { NetworkService } from '../services/NetworkService';
import { GithubUserOrganisation } from '../../src/types';
import debounce from 'lodash/debounce';
import { GithubSearchRepo, GithubSearchResult } from '../types';

interface Props {
  accessToken: string;
  username: string;
}

const pullRequestURLMapForRepo = (pullRequestsForRepo: any[]) =>
  pullRequestsForRepo.reduce((acc: Map<string, boolean>, pullRequest) => {
    if (!acc.get(pullRequest)) {
      acc.set(pullRequest.url, true);
    }
    return acc;
  }, new Map<string, boolean>([]));

const newPullRequests = (
  pullRequestsInState: {},
  newPullRequests: {},
): NewPullRequest[] | undefined => {
  if (pullRequestsInState === undefined || newPullRequests === undefined) {
    return;
  }
  const pullRequestURLMap = Object.keys(pullRequestsInState).reduce(
    (acc, repoName) => {
      const pullRequestsForRepo: any[] =
        pullRequestsInState[repoName as keyof typeof pullRequestsInState];
      const pullRequestsMapForRepo = pullRequestURLMapForRepo(
        pullRequestsForRepo,
      );
      if (Array.from(acc.entries()).length > 0) {
        acc = new Map([...acc, ...pullRequestsMapForRepo]);
      } else {
        acc = pullRequestsMapForRepo;
      }
      return acc;
    },
    new Map<string, boolean>([]),
  );

  const newPullRequestsUrls = Object.keys(newPullRequests).reduce(
    (acc, repoName) => {
      if (
        pullRequestsInState[repoName as keyof typeof pullRequestsInState] ===
        undefined
      ) {
        return acc;
      }
      const prsForRepo: any[] =
        newPullRequests[repoName as keyof typeof newPullRequests];
      if (!prsForRepo) {
        return acc;
      }
      acc.push(...prsForRepo.map((pr) => ({ ...pr, repoName })));
      return acc;
    },
    [] as any[],
  );

  return newPullRequestsUrls.filter(
    (pullRequest) => !pullRequestURLMap.has(pullRequest.url),
  );
};

const searchURL = (searchURI: string, repoOwner: string) =>
  `https://api.github.com/search/repositories?q=${searchURI}%20in:name,description+org:${repoOwner}&per_page=100`;

const GITHUB_USER_ORGANISATIONS = 'https://api.github.com/user/orgs';

export const Sidebar: FC<Props> = ({ accessToken, username }) => {
  const [activePullRequests, setActivePullRequests] = useState<any[]>([]);
  const [openPRList, setOpenPRList] = useState<string | undefined>(undefined);
  const [repoOwner, setRepoOwner] = useState(username);
  const [userInput, setUserInput] = useState('');
  const debounceUserInput = useRef<any>(null);
  const setValidatedUserInput = (downshiftInput: any) => {
    setUserInput(downshiftInput.inputValue);
  };
  if (!debounceUserInput.current) {
    debounceUserInput.current = debounce(setValidatedUserInput, 500);
  }
  const [userOrganisations, setUserOrganisations] = useState<
    GithubUserOrganisation[]
  >([]);
  const [trackedRepos, setTrackedRepos] = useState<GithubSearchRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GithubSearchRepo[]>([]);
  const previousPullRequests = usePrevious(activePullRequests);
  const networkService = new NetworkService(accessToken);

  useEffect(() => {
    (async () => {
      if (!userInput || userInput.length < 2) {
        return;
      }
      const trimmedInput = userInput?.trim();
      await repoSearch(trimmedInput);
    })();
  }, [userInput]);

  const repoSearch = async (input: string) => {
    const uriEncodedInput = encodeURIComponent(input);
    const data = await networkService.get<GithubSearchResult>(
      searchURL(uriEncodedInput, repoOwner),
    );
    const alreadySelectedRepos = trackedRepos.map((repo) =>
      repo.name.toLowerCase(),
    );
    setFilteredRepos(
      data?.items
        .filter(
          (repo) => !alreadySelectedRepos.includes(repo.name.toLowerCase()),
        )
        .sort(
          (a, b) =>
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
        ) ?? [],
    );
  };

  useEffect(() => {
    if (
      previousPullRequests === undefined ||
      previousPullRequests.length === 0
    ) {
      return;
    }
    const foundPullRequests = newPullRequests(
      previousPullRequests,
      activePullRequests,
    );
    if (!foundPullRequests) {
      return;
    }
    if (foundPullRequests.length > 0) {
      foundPullRequests.forEach((pullRequest) => {
        VSCodeService.sendMessage(Message.newPullRequest, pullRequest);
      });
    }
  }, [activePullRequests]);

  useEffect(() => {
    (async () => {
      if (!accessToken) {
        return;
      }
      const userGithubOrganisations = await networkService.get<
        GithubUserOrganisation[]
      >(GITHUB_USER_ORGANISATIONS);
      if (!userGithubOrganisations) {
        return;
      }
      setUserOrganisations(userGithubOrganisations);
    })();
  }, [accessToken]);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    closeMenu,
    highlightedIndex,
    setInputValue,
    getItemProps,
  } = useCombobox({
    items: filteredRepos,
    onInputValueChange: debounceUserInput.current,
    itemToString: (item) => item?.name ?? '',
    onSelectedItemChange: ({ selectedItem: selectedRepo }) => {
      if (!selectedRepo) {
        return;
      }
      const repoAlreadyTracked = findRepoByName(selectedRepo.name);
      if (repoAlreadyTracked) {
        return;
      }
      closeMenu();
      setInputValue('');
      setTrackedRepos([...trackedRepos, selectedRepo]);
      setFilteredRepos(
        filteredRepos.filter(
          (repo) => repo.name.toLowerCase() !== selectedRepo.name.toLowerCase(),
        ),
      );
      setOpenPRList(selectedRepo.name);
    },
  });

  const activePullRequestsCount = () => {
    const count = Object.keys(activePullRequests).reduce((acc, key) => {
      acc += activePullRequests[key as any].length;
      return acc;
    }, 0);
    if (count === 0) {
      return '';
    }
    return count > 0 ? `(${count})` : 0;
  };

  const findRepoByName = (name: string): GithubSearchRepo | undefined => {
    return trackedRepos.find(
      (repo) => repo.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const onTrackedRepoDeleteClick = (clickedRepo: GithubSearchRepo) => {
    setTrackedRepos(trackedRepos.filter((repo) => repo !== clickedRepo));
    const updatedPullRequests = activePullRequests;
    delete updatedPullRequests[
      clickedRepo.name as keyof typeof updatedPullRequests
    ];
    setActivePullRequests(updatedPullRequests);
  };

  const onOpenListClick = (clickedRepoName: string) => {
    openPRList === clickedRepoName
      ? setOpenPRList(undefined)
      : setOpenPRList(clickedRepoName);
  };

  const onRecordClick = ({ name }: { name: string; track: JSX.Element }) => {
    const repo = trackedRepos.find(
      (repo) => repo.name.toLowerCase() === name.toLowerCase(),
    );
    if (!repo) {
      return;
    }
    VSCodeService.sendMessage(Message.openBrowser, `${repo.html_url}/pulls`);
  };

  return (
    <Accordion
      content={[
        {
          name: `PRs ${activePullRequestsCount()}`,
          content:
            trackedRepos.length > 0 ? (
              <>
                {trackedRepos.map((repo) => (
                  <PRList
                    key={repo.name}
                    isOpen={openPRList === repo.name}
                    accessToken={accessToken}
                    repoName={repo.name}
                    repoUrl={repo.html_url}
                    username="barclayd"
                    onOpenListClick={() => onOpenListClick(repo.name)}
                    activePullRequests={activePullRequests}
                    setActivePullRequests={setActivePullRequests}
                  />
                ))}
              </>
            ) : null,
        },
        {
          name: 'Search',
          content: (
            <>
              <label {...getLabelProps()}>Find a repo to track</label>
              <div className="input-wrapper" {...getComboboxProps()}>
                <button
                  type="button"
                  className="search-button"
                  {...getToggleButtonProps()}
                  aria-label="toggle menu"
                  style={{
                    width: '20%',
                  }}
                >
                  <SearchIcon />
                </button>
                <input {...getInputProps()} style={{ width: '80%' }} />
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
                  filteredRepos.map((item, index) => (
                    <li
                      className="dropdown-list-item"
                      style={
                        highlightedIndex === index
                          ? { backgroundColor: '#bde4ff' }
                          : {}
                      }
                      key={`${item}${index}`}
                      {...getItemProps({ item, index })}
                    >
                      {item.name}
                    </li>
                  ))}
              </ul>
              {userOrganisations.length > 0 && (
                <div>
                  <label htmlFor="organisations">Search org repos</label>
                  <select id="organisations">
                    {userOrganisations.map((organisation) => (
                      <option key={organisation.login}>
                        {organisation.login}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ),
        },
        {
          name: `Repos ${
            trackedRepos.length > 0 ? `(${trackedRepos.length})` : ''
          }`,
          content:
            trackedRepos.length > 0 ? (
              <Table
                isOpen
                records={trackedRepos.map((repo) => ({
                  name: repo.name,
                  track: (
                    <TrashIcon onClick={() => onTrackedRepoDeleteClick(repo)} />
                  ),
                }))}
                onRecordClick={onRecordClick}
              />
            ) : null,
        },
      ]}
    />
  );
};
