import { Dispatch, FC, SetStateAction } from 'react';
import { AccordionItem, GithubSearchRepo } from '../../types';
import { PRList } from '../PRList';

interface PRTabProps {
  trackedRepos: GithubSearchRepo[];
  openPRList?: string;
  accessToken: string;
  onOpenListClick: (clickedRepoName: string) => void;
  activePullRequests: any[];
  setActivePullRequests: Dispatch<SetStateAction<any[]>>;
  username: string;
}

interface PRListsProps extends PRTabProps {}

const getActivePullRequests = (activePullRequests: any[]) => {
  const count = Object.keys(activePullRequests).reduce((acc, key) => {
    acc += activePullRequests[key as any].length;
    return acc;
  }, 0);
  return {
    activePullRequestsCount: count,
    formattedCount: count > 0 ? `(${count})` : '',
  };
};

export const PRTab = ({
  trackedRepos,
  accessToken,
  activePullRequests,
  onOpenListClick,
  openPRList,
  setActivePullRequests,
  username,
}: PRTabProps): AccordionItem => {
  const { activePullRequestsCount, formattedCount } = getActivePullRequests(
    activePullRequests,
  );
  return {
    name: `PRs ${formattedCount}`,
    isEnabled: activePullRequestsCount > 0,
    content: (
      <PRLists
        trackedRepos={trackedRepos}
        accessToken={accessToken}
        activePullRequests={activePullRequests}
        setActivePullRequests={setActivePullRequests}
        openPRList={openPRList}
        onOpenListClick={onOpenListClick}
        username={username}
      />
    ),
  };
};

const PRLists: FC<PRListsProps> = ({
  trackedRepos,
  accessToken,
  activePullRequests,
  username,
  openPRList,
  onOpenListClick,
  setActivePullRequests,
}) => {
  return trackedRepos.length > 0 ? (
    <>
      {trackedRepos.map((repo) => (
        <PRList
          key={repo.name}
          isOpen={openPRList === repo.name}
          accessToken={accessToken}
          repoName={repo.name}
          repoUrl={repo.html_url}
          organisation={repo.organisation}
          username={username}
          onOpenListClick={() => onOpenListClick(repo.name)}
          activePullRequests={activePullRequests}
          setActivePullRequests={setActivePullRequests}
        />
      ))}
    </>
  ) : null;
};
