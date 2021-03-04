import { User } from '../../globals/types';
import { GithubSearchRepo } from '../../webviews/types';
import { GlobalStateService } from './GlobalStateService';

export class UserService {
  static USER = 'USER';
  static TRACKED_REPOS = 'TRACKED_REPOS';

  constructor(private globalStateService: GlobalStateService) {}

  public getUser() {
    return this.globalStateService.get<User>(UserService.USER);
  }

  public async setUser(user: User) {
    await this.globalStateService.update(UserService.USER, user);
  }

  public async resetUser() {
    await this.globalStateService.reset(UserService.USER);
    await this.globalStateService.reset(UserService.TRACKED_REPOS);
  }

  public getTrackedRepos() {
    return this.globalStateService.get<GithubSearchRepo[]>(
      UserService.TRACKED_REPOS,
    );
  }

  public setTrackedRepos(trackedRepos: GithubSearchRepo[]) {
    return this.globalStateService.update(
      UserService.TRACKED_REPOS,
      trackedRepos,
    );
  }
}
