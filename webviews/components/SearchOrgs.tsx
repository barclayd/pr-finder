import { UseComboboxActions } from 'downshift';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { GithubUserOrganisation } from '../../src/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { NetworkService } from '../services/NetworkService';
import { GithubSearchRepo } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface SearchOrgsProps
  extends Pick<UseComboboxActions<void>, 'setInputValue' | 'closeMenu'> {
  setFilteredRepos: Dispatch<SetStateAction<GithubSearchRepo[]>>;
  selectedOrganisation?: string;
  setSelectedOrganisation: Dispatch<SetStateAction<string | undefined>>;
  networkService: NetworkService;
  username: string;
  accessToken: string;
}

const GITHUB_USER_ORGANISATIONS = 'https://api.github.com/user/orgs';

export const SearchOrgs: FC<SearchOrgsProps> = ({
  setFilteredRepos,
  closeMenu,
  setInputValue,
  networkService,
  username,
  accessToken,
  selectedOrganisation,
  setSelectedOrganisation,
}) => {
  const [allUserOrgs, setAllUserOrgs] = useState<GithubUserOrganisation[]>([]);
  const [searchableUserOrgs, setSearchableUserOrgs] = useState<
    GithubUserOrganisation[]
  >([]);

  const [searchOrgRepo, setSearchOrgRepo] = useState(false);
  const [showRestrictionPrompt, setShowRestrictionPrompt] = useState(false);

  const ALL_GITHUB_USER_ORGANISATIONS_URL = `https://api.github.com/users/${username}/orgs`;

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

  const clearDropdownOnOrgChange = () => {
    setFilteredRepos([]);
    closeMenu();
    setInputValue('');
  };

  const isSearchableOrgs = searchOrgRepo && searchableUserOrgs.length > 0;

  const missingOrgWarningTitle =
    allUserOrgs.length > 0 && searchableUserOrgs.length === 0
      ? 'No orgs available to search'
      : "Can't find the orgs you were looking for?";

  const hideShowOrganisationRestrictionPrompt = () => {
    setShowRestrictionPrompt(false);
  };

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
    </>
  );
};
