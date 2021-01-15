import './sidebar.css';
import { FC, useState } from 'react';
import { Message } from '../../globals/types';
import { useCombobox } from 'downshift';
import { Table } from './Table';
import { VSCodeService } from '../services/VSCodeService';
import { PRList } from './PRList';
import { Accordion } from './Accordion';
import { Repo } from './SidebarContainer';

interface Props {
  repos: Repo[];
  filteredItems: string[];
  accessToken?: string;
  setFilteredItems: (items: string[]) => void;
}

export const Sidebar: FC<Props> = ({ filteredItems, setFilteredItems, repos, accessToken }) => {
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
                  .includes(repo),
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

  const findRepoByName = (name: string): Repo | undefined => {
    return repos.find((repo) => repo.name === name);
  };

  const onTrackedRepoClick = (clickedRepo: Repo) => {
    setTrackedRepos(trackedRepos.filter((repo) => repo !== clickedRepo));
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
          name: 'PRs',
          content:
            trackedRepos.length > 0 ? (
              <>
                {trackedRepos.map((repo) => (
                  <PRList
                    key={repo.name}
                    isOpen={openPRList === repo.name}
                    accessToken={accessToken}
                    repoName={repo.name}
                    username="barclayd"
                    onOpenListClick={() => onOpenListClick(repo.name)}
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
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="search"
                      className="svg-inline--fa fa-search fa-w-16"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path
                        fill="currentColor"
                        d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                      ></path>
                    </svg>
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
                  track: (
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="far"
                      data-icon="trash-alt"
                      className="svg-inline--fa fa-trash-alt fa-w-14"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      onClick={() => onTrackedRepoClick(repo)}
                    >
                      <path
                        fill="currentColor"
                        d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"
                      ></path>
                    </svg>
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
