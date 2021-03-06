import '../styles/PRList.css';
import { FC, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Message } from '../../globals/types';
import {
  getSdk,
  Maybe,
  OrgPrQuery,
  PrQuery,
  PullRequest,
} from '../generated/graphql';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Table } from './Table';

interface PRListProps {
  accessToken: string | undefined;
  repoName: string;
  organisation?: string;
  username: string;
  isOpen: boolean;
  onOpenListClick: () => void;
  repoUrl: string;
  activePullRequests: any[];
  setActivePullRequests: (prList: any[]) => void;
}

type PullRequests = Array<Maybe<PullRequest>>;

const goToPage = (url: string) => {
  VSCodeService.sendMessage(Message.openBrowser, url);
};

const formatPRTitle = (title: string) => {
  if (title.length <= 46) {
    return title;
  }
  return `${title.substring(0, 43)}...`;
};

const isPullRequestAwaitingReview = ({
  pullRequest,
  username,
  showDrafts,
}: {
  pullRequest: Maybe<PullRequest>;
  username: string;
  showDrafts: boolean;
}) => {
  if (!pullRequest) {
    return false;
  }
  console.log(pullRequest);
  const isUserPRAuthor = pullRequest.author?.login === username;
  const isAlreadyReviewed = pullRequest.reviews?.nodes
    ?.map((reviewer) => reviewer?.author?.login)
    .includes(username);
  const isDraftPRViewable = showDrafts ? true : !pullRequest.isDraft;
  return !isUserPRAuthor && !isAlreadyReviewed && isDraftPRViewable;
};

const isOrgPR = (pr: OrgPrQuery | PrQuery): pr is OrgPrQuery => {
  return (pr as OrgPrQuery).organization !== undefined;
};

export const PRList: FC<PRListProps> = ({
  accessToken,
  repoName,
  username,
  isOpen,
  onOpenListClick,
  activePullRequests,
  setActivePullRequests,
  repoUrl,
  organisation,
}) => {
  const fallback = <></>;

  const queryKey = ['pr', repoName];
  const queryClient = useQueryClient();

  const { refreshTime, showDrafts } = useSettingsContext();

  const client = accessToken
    ? new GraphQLService(accessToken).client
    : undefined;
  if (!client) {
    return fallback;
  }
  const sdk = getSdk(client);
  const { data: prData } = useQuery(
    queryKey,
    async () =>
      organisation
        ? await sdk.OrgPR({ org: organisation, repo: repoName })
        : await sdk.PR({ repo: repoName }),
    {
      staleTime: GraphQLService.STALE_TIME,
      refetchInterval: refreshTime,
      refetchOnMount: false,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!prData) {
      return;
    }
    const pullRequestsForRepo = isOrgPR(prData)
      ? prData.organization?.repository?.pullRequests
      : prData.viewer.repository?.pullRequests;
    if (!pullRequestsForRepo) {
      return;
    }
    const { nodes } = pullRequestsForRepo;
    if (!nodes) {
      return;
    }
    const pullRequestsWaitingReview = (nodes as PullRequests).filter(
      (pullRequest) =>
        isPullRequestAwaitingReview({
          pullRequest,
          showDrafts,
          username,
        }),
    );
    const updatedPullRequests = {
      ...activePullRequests,
      [repoName]: pullRequestsWaitingReview,
    };
    setActivePullRequests(updatedPullRequests);
  }, [prData]);

  if (activePullRequests[repoName as any]?.length === 0) {
    return fallback;
  }

  const onSyncClick = async () => {
    await queryClient.invalidateQueries(queryKey);
  };

  const TableName = () => (
    <span className="pr-title" onClick={() => goToPage(repoUrl + '/pulls')}>
      {repoName.toLowerCase()}{' '}
      <span className="pr-count">
        {`(${activePullRequests[repoName as any]?.length})` ?? ''}
      </span>
    </span>
  );

  return (
    <Table
      records={activePullRequests[repoName as any]
        ?.filter((pr: any) => pr !== null && pr !== undefined)
        .map((pr: any) => ({
          title: (
            <div className="title-wrapper">
              <div className="pr-title" onClick={() => goToPage(pr!.url)}>
                {formatPRTitle(pr!.title)}
              </div>
              {pr!.author?.avatarUrl ? (
                <img
                  src={pr!.author.avatarUrl}
                  alt={pr!.author.login}
                  onClick={() => goToPage(pr!.author!.url)}
                />
              ) : (
                <div>
                  {pr!.author?.login} onClick={() => goToPage(pr!.author!.url)}
                </div>
              )}
            </div>
          ),
        }))}
      isOpen={isOpen}
      tableName={<TableName />}
      onCaretClick={onOpenListClick}
      onSyncClick={onSyncClick}
      checkbox
    />
  );
};
