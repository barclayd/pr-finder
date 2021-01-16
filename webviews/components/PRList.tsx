import { FC, useEffect } from 'react';
import { getSdk } from '../generated/graphql';
import { useQuery, useQueryClient } from 'react-query';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Message } from '../../globals/types';
import { Table } from './Table';
import '../styles/PRList.css';

interface PRListProps {
  accessToken: string | undefined;
  repoName: string;
  username: string;
  isOpen: boolean;
  onOpenListClick: () => void;
  repoUrl: string;
  activePullRequests: any[];
  setActivePullRequests: (prList: any[]) => void;
}

const goToPage = (url: string) => {
  VSCodeService.sendMessage(Message.openBrowser, url);
};

const formatPRTitle = (title: string) => {
  if (title.length <= 46) {
    return title;
  }
  return `${title.substring(0, 43)}...`;
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
}) => {
  const fallback = <></>;

  const queryKey = ['pr', repoName];
  const queryClient = useQueryClient();

  const client = accessToken
    ? new GraphQLService(accessToken).client
    : undefined;
  if (!client) {
    return fallback;
  }
  const sdk = getSdk(client);
  const data = useQuery(
    queryKey,
    async () => await sdk.PR({ repo: repoName }),
    {
      staleTime: GraphQLService.STALE_TIME,
      refetchInterval: GraphQLService.REFETCH_INTERVAL,
      refetchOnMount: false,
      refetchIntervalInBackground: true,
    },
  );
  useEffect(() => {
    const pullRequestsForRepo = data.data?.viewer.repository?.pullRequests;
    if (!pullRequestsForRepo) {
      return;
    }
    const { nodes } = pullRequestsForRepo;
    if (!nodes) {
      return;
    }
    const pullRequestsWaitingReview = nodes.filter(
      (node) =>
        node?.author?.login !== username &&
        !node?.reviews?.nodes
          ?.map((review) => review?.author?.login)
          .includes(username),
    );
    const updatedPullRequests = {
      ...activePullRequests,
      [repoName]: pullRequestsWaitingReview,
    };
    setActivePullRequests(updatedPullRequests);
  }, [data.data?.viewer.repository?.pullRequests]);

  if (activePullRequests[repoName as any]?.length === 0) {
    return fallback;
  }

  const onSyncClick = async () => {
    await queryClient.invalidateQueries(queryKey)
  }

  const TableName = () => (
    <span className="pr-title" onClick={() => goToPage(repoUrl + '/pulls')}>
      {repoName}
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
