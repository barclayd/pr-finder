import { FC, useEffect } from 'react';
import { getSdk, OrgPrQuery, PrQuery } from '../generated/graphql';
import { useQuery, useQueryClient } from 'react-query';
import { GraphQLService } from '../services/GraphQLService';
import { VSCodeService } from '../services/VSCodeService';
import { Message } from '../../globals/types';
import { Table } from './Table';
import '../styles/PRList.css';

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

const goToPage = (url: string) => {
  VSCodeService.sendMessage(Message.openBrowser, url);
};

const formatPRTitle = (title: string) => {
  if (title.length <= 46) {
    return title;
  }
  return `${title.substring(0, 43)}...`;
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

  const client = accessToken
    ? new GraphQLService(accessToken).client
    : undefined;
  if (!client) {
    return fallback;
  }
  const sdk = getSdk(client);
  const { data: prData} = useQuery(
    queryKey,
    async () =>
      organisation
        ? await sdk.OrgPR({ org: organisation, repo: repoName })
        : await sdk.PR({ repo: repoName }),
    {
      staleTime: GraphQLService.STALE_TIME,
      refetchInterval: GraphQLService.REFETCH_INTERVAL,
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
