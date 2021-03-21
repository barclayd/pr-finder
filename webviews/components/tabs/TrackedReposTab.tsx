import { FC } from 'react';
import { Message } from '../../../globals/types';
import { VSCodeService } from '../../services/VSCodeService';
import {
  AccordionItem,
  GithubSearchRepo,
  SetState,
  TrackedPullRequests,
} from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { Table } from '../Table';

interface TrackedReposTab {
  trackedRepos: GithubSearchRepo[];
  activePullRequests: TrackedPullRequests;
  setActivePullRequests: SetState<TrackedPullRequests>;
  setTrackedRepos: SetState<GithubSearchRepo[]>;
}

interface TrackedReposProps extends TrackedReposTab {}

export const TrackedReposTab = (props: TrackedReposTab): AccordionItem => {
  const { trackedRepos } = props;
  return {
    name: `Tracked Repos ${
      trackedRepos.length > 0 ? `(${trackedRepos.length})` : ''
    }`,
    isEnabled: trackedRepos.length > 0,
    content: <TrackedRepos {...props} />,
  };
};

const TrackedRepos: FC<TrackedReposProps> = ({
  trackedRepos,
  activePullRequests,
  setActivePullRequests,
  setTrackedRepos,
}) => {
  const onRecordClick = ({ name }: { name: string; track: JSX.Element }) => {
    const repo = trackedRepos.find(
      (repo) => repo.name.toLowerCase() === name.toLowerCase(),
    );
    if (!repo) {
      return;
    }
    VSCodeService.sendMessage(Message.openBrowser, `${repo.html_url}/pulls`);
  };

  const onTrackedRepoDeleteClick = (clickedRepo: GithubSearchRepo) => {
    setTrackedRepos(trackedRepos.filter((repo) => repo !== clickedRepo));
    const updatedPullRequests = activePullRequests;
    delete updatedPullRequests[
      clickedRepo.name as keyof typeof updatedPullRequests
    ];
    setActivePullRequests(updatedPullRequests);
  };

  return trackedRepos.length > 0 ? (
    <Table
      isOpen
      records={trackedRepos.map((repo) => ({
        name: repo.name,
        track: <TrashIcon onClick={() => onTrackedRepoDeleteClick(repo)} />,
      }))}
      onRecordClick={onRecordClick}
    />
  ) : null;
};
