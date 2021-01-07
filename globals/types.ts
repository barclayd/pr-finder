export enum Message {
  addRepo = 'addRepo',
  getToken = 'getToken',
  onInfo = 'onInfo',
  onError = 'onError'
}

export interface vsCodeData {
  type: Message;
  value: string;
}
