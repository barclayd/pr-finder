import { FC, useState } from 'react';
import { Message } from '../../globals/types';
import { useCombobox } from 'downshift';
import { Table } from './Table';
import { VSCodeService } from '../services/VSCodeService';
import { PRList } from './PRList';
import { Accordion } from './Accordion';
import { Repo } from './SidebarContainer';
import { SearchIcon } from './icons/Search';
import { TrashIcon } from './icons/Trash';
import '../styles/sidebar.css';

interface Props {
  repos: Repo[];
  accessToken?: string;
  filteredItems: string[];
  setFilteredItems: (items: string[]) => void;
}

export const Sidebar: FC<Props> = ({
  filteredItems,
  setFilteredItems,
  repos,
  accessToken,
}) => {
  const [activePullRequests, setActivePullRequests] = useState<any[]>([]);
  const [openPRList, setOpenPRList] = useState<string | undefined>(undefined);
  const [trackedRepos, setTrackedRepos] = useState<Repo[]>([]);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    openMenu,
    getInputProps,
    getComboboxProps,
    closeMenu,
    highlightedIndex,
    setInputValue,
    getItemProps,
  } = useCombobox({
    items: filteredItems,
    onIsOpenChange: ({ isOpen }) => {
      if (isOpen) {
        setFilteredItems(
          repos
            .map((repo) => repo.name)
            .filter(
              (repo) =>
                !trackedRepos
                  .map((repo) => repo.name.toLowerCase())
                  .includes(repo.toLowerCase()),
            ),
        );
      }
    },
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
        closeMenu();
        setOpenPRList(repo.name);
        setFilteredItems(
          repos
            .filter(
              (trackedRepo) =>
                trackedRepo.name.toLowerCase() !== selectedItem.toLowerCase(),
            )
            .map((repo) => repo.name),
        );
      }
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

  const findRepoByName = (name: string): Repo | undefined => {
    return repos.find((repo) => repo.name === name);
  };

  const onTrackedRepoDeleteClick = (clickedRepo: Repo) => {
    setTrackedRepos(trackedRepos.filter((repo) => repo !== clickedRepo));
    const updatedPullRequests = activePullRequests;
    delete updatedPullRequests[clickedRepo.name as any];
    setActivePullRequests(updatedPullRequests);
  };

  const onOpenListClick = (clickedRepoName: string) => {
    openPRList === clickedRepoName
      ? setOpenPRList(undefined)
      : setOpenPRList(clickedRepoName);
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
                    repoUrl={repo.url}
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
          content:
            repos.length > 0 ? (
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
                  <input
                    {...getInputProps()}
                    style={{ width: '80%' }}
                    onFocus={() => openMenu()}
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
                  {isOpen &&
                    filteredItems.map((item, index) => (
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
                        {item}
                      </li>
                    ))}
                </ul>
              </>
            ) : null,
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
                  track: <TrashIcon onClick={() => onTrackedRepoDeleteClick(repo)} />,
                }))}
                onRecordClick={onRecordClick}
              />
            ) : null,
        },
      ]}
    />
  );
};
