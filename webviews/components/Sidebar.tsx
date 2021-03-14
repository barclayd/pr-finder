import '../styles/sidebar.css';
import { FC, useEffect, useState } from 'react';
import { Message, NewPullRequest } from '../../globals/types';
import { usePrevious } from '../hooks/usePrevious';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { NetworkService } from '../services/NetworkService';
import { VSCodeService } from '../services/VSCodeService';
import { GithubSearchRepo, TrackedPullRequests } from '../types';
import { Accordion } from './Accordion';
import { TrashIcon } from './icons/TrashIcon';
import { Settings } from './Settings';
import { Table } from './Table';
import { PRTab } from './tabs/PRTab';
import { SearchReposTab } from './tabs/SearchReposTab';

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

export const Sidebar: FC<Props> = ({
  accessToken,
  username,
  initialTrackedRepos,
}) => {
  const [
    activePullRequests,
    setActivePullRequests,
  ] = useState<TrackedPullRequests>({});
  const [openPRList, setOpenPRList] = useState<string | undefined>();
  const [trackedRepos, setTrackedRepos] = useState(initialTrackedRepos);
  const previousPullRequests = usePrevious(activePullRequests);
  const { showNotifications } = useSettingsContext();

  const networkService = new NetworkService(accessToken);

  useEffect(() => {
    if (trackedRepos !== initialTrackedRepos) {
      VSCodeService.sendMessage(Message.setTrackedRepos, trackedRepos);
    }
  }, [trackedRepos]);

  useEffect(() => {
    if (!showNotifications) {
      return;
    }
    if (
      previousPullRequests === undefined ||
      Object.keys(previousPullRequests).length === 0
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
        PRTab({
          activePullRequests,
          accessToken,
          username,
          setActivePullRequests,
          trackedRepos,
          openPRList,
          onOpenListClick,
        }),
        SearchReposTab({
          trackedRepos,
          setTrackedRepos,
          setOpenPRList,
          networkService,
          username,
          accessToken,
        }),
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
