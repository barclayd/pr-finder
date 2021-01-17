import { Message } from '../../globals/types';

export class VSCodeService {
  static sendMessage(type: Message, value?: any) {
    tsVscode.postMessage({
      type,
      value,
    });
  }
}
