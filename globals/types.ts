export enum Message {
  addRepo = 'addRepo',
  getUser = 'getUser',
  getTrackedRepos = 'getTrackedRepos',
  setTrackedRepos = 'setTrackedRepos',
  getSettings = 'getSettings',
  setSettings = 'setSettings',
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
    login?: string;
    avatarUrl?: string;
  };
  repoName: string;
  title: string;
  url: string;
}

export interface User {
  accessToken: string;
  username: string;
}

export interface Settings {
  showNotifications: boolean;
  showDrafts: boolean;
  refreshTime: number;
}
