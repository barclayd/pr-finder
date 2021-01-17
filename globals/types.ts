export enum Message {
  addRepo = 'addRepo',
  getToken = 'getToken',
  openBrowser = 'openBrowser',
  newPullRequest = 'newPullRequest',
  onInfo = 'onInfo',
  onError = 'onError'
}

export interface VSCodeData {
  type: Message;
  value?: any;
}

export interface NewPullRequest {
  author: {
    login: string;
    avatarUrl: string;
  },
  repoName: string;
  title: string;
  url: string;
}
