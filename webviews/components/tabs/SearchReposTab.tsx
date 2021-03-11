import { useCombobox } from 'downshift';
import debounce from 'lodash/debounce';
import { Dispatch, FC, SetStateAction, useRef, useState } from 'react';
import { GithubUserOrganisation } from '../../../src/types';
import { AccordionItem, GithubSearchRepo } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { SearchIcon } from '../icons/SearchIcon';

interface SearchReposTab {
  trackedRepos: GithubSearchRepo[];
  setTrackedRepos: Dispatch<SetStateAction<GithubSearchRepo[]>>;
  setOpenPRList: Dispatch<SetStateAction<string | undefined>>;
}
interface SearchReposProps extends SearchReposTab {}

const disabledGithubRepo = '!disabled!';

const findRepoByName = (
  name: string,
  trackedRepos: GithubSearchRepo[],
): GithubSearchRepo | undefined => {
  return trackedRepos.find(
    (repo) => repo.name.toLowerCase() === name.toLowerCase(),
  );
};

export const SearchReposTab = (props: SearchReposTab): AccordionItem => ({
  name: 'Search Repos',
  isEnabled: true,
  content: <SearchRepos {...props} />,
});

const SearchRepos: FC<SearchReposProps> = ({
  trackedRepos,
  setTrackedRepos,
  setOpenPRList,
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

  const [userInput, setUserInput] = useState('');
  const debounceUserInput = useRef<any>(null);
  const setValidatedUserInput = (downshiftInput: any) => {
    setUserInput(downshiftInput.inputValue);
  };
  if (!debounceUserInput.current) {
    debounceUserInput.current = debounce(setValidatedUserInput, 500);
  }

  const missingOrgWarningTitle =
    allUserOrgs.length > 0 && searchableUserOrgs.length === 0
      ? 'No orgs available to search'
      : "Can't find the orgs you were looking for?";

  const isNoResults =
    filteredRepos.length === 1 && filteredRepos[0].name === disabledGithubRepo;

  const hideShowOrganisationRestrictionPrompt = () => {
    setShowRestrictionPrompt(false);
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

  const resultsFound = isOpen && !isNoResults;
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
        {resultsFound
          ? filteredRepos.map((item, index) => (
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
            ))
          : filteredRepos.map((item, index) => (
              <li
                className="dropdown-list-item disabled-list-item"
                key={item.name}
                {...getItemProps({ item, index, disabled: true })}
              >
                No results found
              </li>
            ))}
      </ul>
    </>
  );
};
