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
  userOnServerStatus?: string;
};

export type State<T> = T & { setState: (partialState: Partial<T>) => void };

export type GlobalState = {
  activePullRequests: any;
  trackedRepos?: GithubSearchRepo[];
};
