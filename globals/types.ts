export enum Message {
  addRepo = 'addRepo',
  getToken = 'getToken',
  openBrowser = 'openBrowser',
  onInfo = 'onInfo',
  onError = 'onError'
}

export interface vsCodeData {
  type: Message;
  value: string;
}
