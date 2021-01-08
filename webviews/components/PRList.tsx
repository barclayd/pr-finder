import { FC } from 'react';
import { getSdk } from '../generated/graphql';
import { useQuery } from 'react-query';
import { GraphQLService } from '../services/GraphQLService';
import './PRList.css';
import { VSCodeService } from '../services/VSCodeService';
import { Message } from '../../globals/types';

interface PRListProps {
  accessToken: string | undefined;
  repoName: string;
  username: string;
}

const goToAuthorProfile = (authorUrl: string) => {
  VSCodeService.sendMessage(Message.openBrowser, authorUrl);
};

export const PRList: FC<PRListProps> = ({ accessToken, repoName, username }) => {
  const fallback = <></>;
  const client = accessToken
    ? new GraphQLService(accessToken).client
    : undefined;
  if (!client) {
    return fallback;
  }
  const sdk = getSdk(client);
  const data = useQuery(['pr', repoName], async () => await sdk.PR({ repo: repoName }));
  const pullRequests = data.data?.viewer.repository?.pullRequests;
  if (!pullRequests) {
    return fallback;
  }
  const { nodes, totalCount } = pullRequests;
  if (!nodes) {
    return fallback;
  }
  const pullRequestsWaitingReview = nodes.filter(
    (node) =>
      node?.author?.login !== username &&
      node?.reviews?.nodes?.map((review) => review?.author?.login !== username),
  );
  return (
    <>
      <div>PRs waiting review: {totalCount}</div>
      {pullRequestsWaitingReview.map((node, index) => {
        if (!node) {
          return fallback;
        }
        return (
          <div key={repoName + node.title + index}>
            <div>{node.title}</div>
            <div>{repoName}</div>
            {node.author && (
              <div className="pr-author" onClick={() => goToAuthorProfile(node.author!.url)}>
                {node.author.avatarUrl ? (
                  <img src={node.author.avatarUrl} alt={node.author.login} />
                ) : (
                  <div>{node.author.login}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
