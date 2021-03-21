import {
  UseComboboxActions,
  UseComboboxPropGetters,
  UseComboboxState,
} from 'downshift';
import { FC } from 'react';
import { GithubSearchRepo } from '../../types';
import { SearchIcon } from '../icons/SearchIcon';

type ComboboxGetters = Omit<
  UseComboboxPropGetters<GithubSearchRepo>,
  'getLabelProps'
>;
type ComboboxState = Pick<UseComboboxActions<GithubSearchRepo>, 'openMenu'> &
  Pick<
    UseComboboxState<GithubSearchRepo>,
    'highlightedIndex' | 'inputValue' | 'isOpen'
  >;
type Combobox = ComboboxState & ComboboxGetters;

export interface SearchDropdownProps extends Combobox {
  filteredRepos: GithubSearchRepo[];
  disabledGithubRepo: string;
}

export const SearchDropdown: FC<SearchDropdownProps> = ({
  filteredRepos,
  disabledGithubRepo,
  inputValue,
  highlightedIndex,
  openMenu,
  isOpen,
  getComboboxProps,
  getToggleButtonProps,
  getMenuProps,
  getInputProps,
  getItemProps,
}) => {
  const openDropdown = () => {
    if (inputValue.trim().length === 0) {
      return;
    }
    openMenu();
  };

  const isNoResults =
    filteredRepos.length === 1 && filteredRepos[0].name === disabledGithubRepo;

  const showFoundResults = isOpen && !isNoResults;

  return (
    <>
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
          onFocus={openDropdown}
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
