import { FC } from 'react';
import { getSdk } from '../generated/graphql';
import { useQuery } from 'react-query';
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
}) => {
  const fallback = <></>;
  const client = accessToken
    ? new GraphQLService(accessToken).client
    : undefined;
  if (!client) {
    return fallback;
  }
  const sdk = getSdk(client);
  const data = useQuery(
    ['pr', repoName],
    async () => await sdk.PR({ repo: repoName }),
  );
  const pullRequests = data.data?.viewer.repository?.pullRequests;
  if (!pullRequests) {
    return fallback;
  }
  const { nodes } = pullRequests;
  if (!nodes) {
    return fallback;
  }
  const pullRequestsWaitingReview = nodes.filter(
    (node) =>
      node?.author?.login !== username &&
      !node?.reviews?.nodes
        ?.map((review) => review?.author?.login)
        .includes(username),
  );
  const totalCount = pullRequestsWaitingReview.length;
  if (totalCount === 0) {
    return fallback;
  }

  return (
    <Table
      records={pullRequestsWaitingReview
        .filter((pr) => pr !== null && pr !== undefined)
        .map((pr) => ({
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
      tableName={repoName + ` (${totalCount})`}
      onCaretClick={onOpenListClick}
      checkbox
    />
  );
};
