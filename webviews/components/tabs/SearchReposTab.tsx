import { useCombobox } from 'downshift';
import type { DebouncedFunc } from 'lodash';
import debounce from 'lodash/debounce';
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GithubUserOrganisation } from '../../../src/types';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { NetworkService } from '../../services/NetworkService';
import {
  AccordionItem,
  GithubSearchRepo,
  GithubSearchResult,
} from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { SearchIcon } from '../icons/SearchIcon';

interface SearchReposTab {
  trackedRepos: GithubSearchRepo[];
  setTrackedRepos: Dispatch<SetStateAction<GithubSearchRepo[]>>;
  setOpenPRList: Dispatch<SetStateAction<string | undefined>>;
  username: string;
  accessToken: string;
  networkService: NetworkService;
}
interface SearchReposProps extends SearchReposTab {}

type DownshiftInput = { inputValue?: string };

type LodashDebounceFunc = DebouncedFunc<
  (downshiftInput: DownshiftInput) => void
>;

const disabledGithubRepo = '!disabled!';

const findRepoByName = (
  name: string,
  trackedRepos: GithubSearchRepo[],
): GithubSearchRepo | undefined => {
  return trackedRepos.find(
    (repo) => repo.name.toLowerCase() === name.toLowerCase(),
  );
};

const searchURL = (searchURI: string, repoOwner: string) =>
  `https://api.github.com/search/repositories?q=${searchURI}%20in:name,description+org:${repoOwner}&per_page=100`;

const GITHUB_USER_ORGANISATIONS = 'https://api.github.com/user/orgs';

export const SearchReposTab = (props: SearchReposTab): AccordionItem => ({
  name: 'Search Repos',
  isEnabled: true,
  content: <SearchRepos {...props} />,
});

const SearchRepos: FC<SearchReposProps> = ({
  trackedRepos,
  setTrackedRepos,
  setOpenPRList,
  username,
  networkService,
  accessToken,
}) => {
  const [allUserOrgs, setAllUserOrgs] = useState<GithubUserOrganisation[]>([]);
  const [searchOrgRepo, setSearchOrgRepo] = useState(false);
  const [searchableUserOrgs, setSearchableUserOrgs] = useState<
    GithubUserOrganisation[]
  >([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<
    string | undefined
  >(undefined);
  const [filteredRepos, setFilteredRepos] = useState<GithubSearchRepo[]>([]);

  const [showRestrictionPrompt, setShowRestrictionPrompt] = useState(false);

  const [userInput, setUserInput] = useState<string | undefined>('');
  const debounceUserInput = useRef<LodashDebounceFunc | null>(null);
  const setValidatedUserInput = ({ inputValue }: DownshiftInput) => {
    setUserInput(inputValue);
  };
  if (!debounceUserInput.current) {
    debounceUserInput.current = debounce(setValidatedUserInput, 500);
  }

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

  useAsyncEffect(async () => {
    const { data: userGithubOrganisations } = await networkService.get<
      GithubUserOrganisation[]
    >(GITHUB_USER_ORGANISATIONS);
    if (!userGithubOrganisations) {
      return;
    }
    setSearchableUserOrgs(userGithubOrganisations);
  }, [accessToken]);

  const missingOrgWarningTitle =
    allUserOrgs.length > 0 && searchableUserOrgs.length === 0
      ? 'No orgs available to search'
      : "Can't find the orgs you were looking for?";

  const ALL_GITHUB_USER_ORGANISATIONS_URL = `https://api.github.com/users/${username}/orgs`;

  const isNoResults =
    filteredRepos.length === 1 && filteredRepos[0].name === disabledGithubRepo;

  const hideShowOrganisationRestrictionPrompt = () => {
    setShowRestrictionPrompt(false);
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
      const repoAlreadyTracked = findRepoByName(
        selectedRepo.name,
        trackedRepos,
      );
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

  const showFoundResults = isOpen && !isNoResults;
  const isSearchableOrgs = searchOrgRepo && searchableUserOrgs.length > 0;

  return (
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
            <CloseIcon onClick={hideShowOrganisationRestrictionPrompt} />
          </div>
          <span className="organisation-prompt">
            Request permission from the org owners to allow PR Finder to view
            them
          </span>
        </div>
      )}
      {isSearchableOrgs && (
        <div className="user-organisations">
          <label htmlFor="organisations">From: </label>
          <select
            id="organisations"
            defaultValue={selectedOrganisation}
            onChange={({ target: { value } }) => setSelectedOrganisation(value)}
          >
            {searchableUserOrgs.map((organisation) => (
              <option value={organisation.login} key={organisation.login}>
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
        {showFoundResults &&
          filteredRepos.map((item, index) => (
            <li
              className="dropdown-list-item"
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.name}
            </li>
          ))}
      </ul>
    </>
  );
};
