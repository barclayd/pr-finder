export interface GithubSearchResult {
  items: GithubSearchRepo[];
}

export interface GithubSearchRepo {
  name: string;
  description: string;
  html_url: string;
  updated_at: string;
}

export interface GithubUser {
  token?: string;
  user?: string;
}
