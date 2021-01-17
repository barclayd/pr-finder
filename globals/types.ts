export enum Message {
  addRepo = 'addRepo',
  getToken = 'getToken',
  openBrowser = 'openBrowser',
  newPullRequest = 'newPullRequest',
  onInfo = 'onInfo',
  onError = 'onError'
}

export interface vsCodeData {
  type: Message;
  value: string;
}
