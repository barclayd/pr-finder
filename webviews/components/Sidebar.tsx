import '../styles/sidebar.css';
import { useCombobox } from 'downshift';
import debounce from 'lodash/debounce';
import { FC, useEffect, useRef, useState } from 'react';
import { Message, NewPullRequest } from '../../globals/types';
import { GithubUserOrganisation } from '../../src/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { usePrevious } from '../hooks/usePrevious';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { NetworkService } from '../services/NetworkService';
import { VSCodeService } from '../services/VSCodeService';
import { GithubSearchRepo, GithubSearchResult } from '../types';
import { Accordion } from './Accordion';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PRList } from './PRList';
import { Settings } from './Settings';
import { Table } from './Table';

interface Props {
  accessToken: string;
  username: string;
  initialTrackedRepos: GithubSearchRepo[];
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

const disabledGithubRepo = '!disabled!';

const searchURL = (searchURI: string, repoOwner: string) =>
  `https://api.github.com/search/repositories?q=${searchURI}%20in:name,description+org:${repoOwner}&per_page=100`;

const GITHUB_USER_ORGANISATIONS = 'https://api.github.com/user/orgs';

export const Sidebar: FC<Props> = ({
  accessToken,
  username,
  initialTrackedRepos,
}) => {
  const [activePullRequests, setActivePullRequests] = useState<any[]>([]);
  const [openPRList, setOpenPRList] = useState<string | undefined>();
  const [selectedOrganisation, setSelectedOrganisation] = useState<
    string | undefined
  >(undefined);
  const [searchOrgRepo, setSearchOrgRepo] = useState(false);
  const [showRestrictionPrompt, setShowRestrictionPrompt] = useState(false);
  const [userInput, setUserInput] = useState('');
  const debounceUserInput = useRef<any>(null);
  const setValidatedUserInput = (downshiftInput: any) => {
    setUserInput(downshiftInput.inputValue);
  };
  if (!debounceUserInput.current) {
    debounceUserInput.current = debounce(setValidatedUserInput, 500);
  }
  const [searchableUserOrgs, setSearchableUserOrgs] = useState<
    GithubUserOrganisation[]
  >([]);
  const [allUserOrgs, setAllUserOrgs] = useState<GithubUserOrganisation[]>([]);
  const [trackedRepos, setTrackedRepos] = useState(initialTrackedRepos);
  const [filteredRepos, setFilteredRepos] = useState<GithubSearchRepo[]>([]);
  const previousPullRequests = usePrevious(activePullRequests);
  const { showNotifications } = useSettingsContext();

  const networkService = new NetworkService(accessToken);

  const ALL_GITHUB_USER_ORGANISATIONS_URL = `https://api.github.com/users/${username}/orgs`;

  useAsyncEffect(async () => {
    if (!userInput || userInput.length < 2) {
      setFilteredRepos([]);
      return;
    }
    const trimmedInput = userInput?.trim();
    await repoSearch(trimmedInput);
  }, [userInput]);

  const repoSearch = async (input: string) => {
    const uriEncodedInput = encodeURIComponent(input);
    const repoOwner = selectedOrganisation ?? username;
    const { data } = await networkService.get<GithubSearchResult>(
      searchURL(uriEncodedInput, repoOwner),
    );
    const alreadySelectedRepos = trackedRepos.map((repo) =>
      repo.name.toLowerCase(),
    );
    if (!data || data.items.length === 0) {
      const disabledGithubSearch: GithubSearchRepo = {
        name: '!disabled!',
        description: '',
        updated_at: '',
        html_url: '',
      };
      setFilteredRepos([disabledGithubSearch]);
      return;
    }
    setFilteredRepos(
      data.items
        .filter(
          (repo) => !alreadySelectedRepos.includes(repo.name.toLowerCase()),
        )
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ) ?? [],
    );
  };

  const clearDropdownOnOrgChange = () => {
    setFilteredRepos([]);
    closeMenu();
    setInputValue('');
  };

  const openDropdown = () => {
    if (inputValue.trim().length === 0) {
      return;
    }
    openMenu();
  };

  useEffect(() => {
    if (!searchOrgRepo) {
      clearDropdownOnOrgChange();
      setSelectedOrganisation(undefined);
      return;
    }
    if (searchableUserOrgs.length === 0) {
      return;
    }
    clearDropdownOnOrgChange();
    setSelectedOrganisation(searchableUserOrgs[0].login);
  }, [searchOrgRepo]);

  useEffect(() => {
    if (trackedRepos !== initialTrackedRepos) {
      VSCodeService.sendMessage(Message.setTrackedRepos, trackedRepos);
    }
  }, [trackedRepos]);

  useAsyncEffect(async () => {
    const { data: allUserOrgs } =
      (await networkService.get<GithubUserOrganisation[]>(
        ALL_GITHUB_USER_ORGANISATIONS_URL,
      )) ?? [];
    setAllUserOrgs(allUserOrgs ?? []);
    if (searchableUserOrgs.length !== allUserOrgs?.length) {
      setShowRestrictionPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (!showNotifications) {
      return;
    }
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

  useAsyncEffect(async () => {
    if (!accessToken) {
      return;
    }
    const { data: userGithubOrganisations } = await networkService.get<
      GithubUserOrganisation[]
    >(GITHUB_USER_ORGANISATIONS);
    if (!userGithubOrganisations) {
      return;
    }
    setSearchableUserOrgs(userGithubOrganisations);
  }, [accessToken]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    inputValue,
    openMenu,
    closeMenu,
    highlightedIndex,
    setInputValue,
    getItemProps,
  } = useCombobox({
    items: filteredRepos,
    onInputValueChange: debounceUserInput.current,
    itemToString: (item) => {
      if (!item || item?.name === disabledGithubRepo) {
        return '';
      }
      return item.name;
    },
    onSelectedItemChange: ({ selectedItem: selectedRepo }) => {
      if (!selectedRepo) {
        return;
      }
      if (selectedRepo.name === disabledGithubRepo) {
        return;
      }
      const repoAlreadyTracked = findRepoByName(selectedRepo.name);
      if (repoAlreadyTracked) {
        return;
      }
      closeMenu();
      setInputValue('');
      if (selectedOrganisation) {
        selectedRepo.organisation = selectedOrganisation;
      }
      setTrackedRepos([...trackedRepos, selectedRepo]);
      setFilteredRepos(
        filteredRepos.filter(
          (repo) => repo.name.toLowerCase() !== selectedRepo.name.toLowerCase(),
        ),
      );
      setOpenPRList(selectedRepo.name);
    },
  });

  const getActivePullRequests = () => {
    const count = Object.keys(activePullRequests).reduce((acc, key) => {
      acc += activePullRequests[key as any].length;
      return acc;
    }, 0);
    return {
      activePullRequestsCount: count,
      formattedCount: count > 0 ? `(${count})` : '',
    };
  };

  const findRepoByName = (name: string): GithubSearchRepo | undefined => {
    return trackedRepos.find(
      (repo) => repo.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const hideShowOrganisationRestrictionPrompt = () => {
    setShowRestrictionPrompt(false);
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

  const isNoResults =
    filteredRepos.length === 1 && filteredRepos[0].name === disabledGithubRepo;

  const missingOrgWarningTitle =
    allUserOrgs.length > 0 && searchableUserOrgs.length === 0
      ? 'No orgs available to search'
      : "Can't find the orgs you were looking for?";

  const { activePullRequestsCount, formattedCount } = getActivePullRequests();

  return (
    <Accordion
      content={[
        {
          name: `PRs ${formattedCount}`,
          isEnabled: activePullRequestsCount > 0,
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
                    organisation={repo.organisation}
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
          name: 'Search Repos',
          isEnabled: true,
          content: (
            <>
              <div className="organisation-checkbox">
                <input
                  className="select-checkbox"
                  type="checkbox"
                  id="select-organisation"
                  onChange={() => setSearchOrgRepo(!searchOrgRepo)}
                />
                <label htmlFor="select-organisation">Search org repos</label>
              </div>
              {searchOrgRepo && showRestrictionPrompt && (
                <div className="all-organisations-prompt">
                  <div className="organisation-prompt-title">
                    <span>{missingOrgWarningTitle}</span>
                    <CloseIcon
                      onClick={hideShowOrganisationRestrictionPrompt}
                    />
                  </div>
                  <span className="organisation-prompt">
                    Request permission from the org owners to allow PR Finder to
                    view them
                  </span>
                </div>
              )}
              {searchOrgRepo && searchableUserOrgs.length > 0 && (
                <div className="user-organisations">
                  <label htmlFor="organisations">From: </label>
                  <select
                    id="organisations"
                    defaultValue={selectedOrganisation}
                    onChange={({ target: { value } }) =>
                      setSelectedOrganisation(value)
                    }
                  >
                    {searchableUserOrgs.map((organisation) => (
                      <option
                        value={organisation.login}
                        key={organisation.login}
                      >
                        {organisation.login}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                <input
                  {...getInputProps()}
                  onFocus={() => openDropdown()}
                  style={{ width: '80%' }}
                />
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
                {isNoResults &&
                  filteredRepos.map((item, index) => (
                    <li
                      className="dropdown-list-item disabled-list-item"
                      key={item.name}
                      {...getItemProps({ item, index, disabled: true })}
                    >
                      No results found
                    </li>
                  ))}
                {isOpen &&
                  !isNoResults &&
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
            </>
          ),
        },
        {
          name: `Tracked Repos ${
            trackedRepos.length > 0 ? `(${trackedRepos.length})` : ''
          }`,
          isEnabled: trackedRepos.length > 0,
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
        {
          name: 'Settings',
          isEnabled: true,
          content: <Settings />,
        },
      ]}
    />
  );
};
