export enum Message {
  addRepo = 'addRepo',
  getGithubUser = 'getGithubUser',
  openBrowser = 'openBrowser',
  newPullRequest = 'newPullRequest',
  onInfo = 'onInfo',
  onLogin = 'onLogin',
  onLogout = 'onLogout',
  onError = 'onError',
}

export interface VSCodeData {
  type: Message;
  value?: any;
}

export interface NewPullRequest {
  author: {
    login: string;
    avatarUrl: string;
  };
  repoName: string;
  title: string;
  url: string;
}
