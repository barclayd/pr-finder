import '../styles/sidebar.css';
import { FC, useEffect, useState } from 'react';
import { Message, NewPullRequest } from '../../globals/types';
import { usePrevious } from '../hooks/usePrevious';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { NetworkService } from '../services/NetworkService';
import { VSCodeService } from '../services/VSCodeService';
import { GithubSearchRepo, PullRequests, TrackedPullRequests } from '../types';
import { Accordion } from './Accordion';
import { Settings } from './Settings';
import { PRTab } from './tabs/PRTab';
import { SearchReposTab } from './tabs/SearchReposTab';
import { TrackedReposTab } from './tabs/TrackedReposTab';

interface Props {
  accessToken: string;
  username: string;
  initialTrackedRepos: GithubSearchRepo[];
}

const pullRequestURLMapForRepo = (pullRequestsForRepo: PullRequests) => {
  return pullRequestsForRepo.reduce((acc, pullRequest) => {
    if (!acc.get(pullRequest.url)) {
      acc.set(pullRequest.url, true);
    }
    return acc;
  }, new Map<string, boolean>([]));
};

const newPullRequests = (
  pullRequestsInState: TrackedPullRequests,
  newPullRequests: TrackedPullRequests,
): NewPullRequest[] | undefined => {
  if (pullRequestsInState === undefined || newPullRequests === undefined) {
    return;
  }
  const pullRequestURLMap = Object.keys(pullRequestsInState).reduce(
    (acc, repoName) => {
      const pullRequestsForRepo: PullRequests =
        pullRequestsInState[repoName as keyof typeof pullRequestsInState];
      const pullRequestsMapForRepo = pullRequestURLMapForRepo(
        pullRequestsForRepo,
      );
      acc = new Map([...acc, ...pullRequestsMapForRepo]);
      return acc;
    },
    new Map<string, boolean>([]),
  );

  const newPullRequestsUrls = Object.keys(newPullRequests).reduce<
    NewPullRequest[]
  >((acc, repoName) => {
    if (
      pullRequestsInState[repoName as keyof typeof pullRequestsInState] ===
      undefined
    ) {
      return acc;
    }
    const prsForRepo: PullRequests =
      newPullRequests[repoName as keyof typeof newPullRequests];
    if (!prsForRepo) {
      return acc;
    }
    acc.push(
      ...prsForRepo.map((pr) => ({
        ...pr,
        repoName,
        author: {
          login: pr.author?.login,
          avatarUrl: pr.author?.avatarUrl,
        },
      })),
    );
    return acc;
  }, []);

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
          setOpenPRList,
        }),
        SearchReposTab({
          trackedRepos,
          setTrackedRepos,
          setOpenPRList,
          networkService,
          username,
          accessToken,
        }),
        TrackedReposTab({
          trackedRepos,
          activePullRequests,
          setActivePullRequests,
          setTrackedRepos,
        }),
        {
          name: 'Settings',
          isEnabled: true,
          content: <Settings />,
        },
      ]}
    />
  );
};
