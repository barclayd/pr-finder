import { Message } from '../../globals/types';

export class VSCodeService {
  static sendMessage(type: Message, value: string = '') {
    tsVscode.postMessage({
      type,
      value,
    });
  }
}
