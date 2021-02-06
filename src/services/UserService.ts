import { User } from '../../globals/types';
import { GlobalStateService } from './GlobalStateService';

export class UserService {
  static USER = 'USER';

  constructor(private globalStateService: GlobalStateService) {}

  public getUser() {
    return this.globalStateService.get<User>(UserService.USER);
  }

  public async setUser(user: User) {
    await this.globalStateService.update(UserService.USER, user);
  }

  public async resetUser() {
    await this.globalStateService.reset(UserService.USER);
  }
}
