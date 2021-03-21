import { PullRequest } from '../generated/graphql';

export interface GithubSearchResult {
  items: GithubSearchRepo[];
}

export interface GithubSearchRepo {
  name: string;
  description: string;
  html_url: string;
  updated_at: string;
  organisation?: string;
}

export type Auth = {
  accessToken?: string;
  githubUsername?: string;
  userOnServerStatus?: 'fetching' | 'notFound' | 'found';
};

export type State<T> = T & { setState: (partialState: Partial<T>) => void };

export type PullRequests = PullRequest[];

export type TrackedPullRequests = Record<string, PullRequests>;

export type GlobalState = {
  activePullRequests: PullRequests;
  trackedRepos?: GithubSearchRepo[];
};

export interface AccordionItem {
  name: string;
  isEnabled: boolean;
  content: JSX.Element | null;
}
