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

export interface GithubUser {
  token?: string;
  user?: string;
}

export type Auth = {
  accessToken?: string;
  githubUsername?: string;
  userOnServerStatus?: string;
};

export type AuthValue = {
  [key in keyof Auth]: string | undefined;
};

export interface AuthState extends Auth {
  setAuthState: (newState: AuthValue) => void;
}
