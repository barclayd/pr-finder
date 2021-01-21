import * as vscode from 'vscode';

export class AuthService {
  static TOKEN_KEY = 'TOKEN_KEY';
  static GITHUB_USER = 'GITHUB_USER';

  constructor(private globalState: vscode.Memento) {}

  private async updateState(key: string, value: string) {
    await this.globalState.update(key, value);
  }

  private readState(key: string) {
    return this.globalState.get<string>(key);
  }

  public async setToken(token: string) {
    await this.updateState(AuthService.TOKEN_KEY, token);
  }

  public getToken() {
    return this.readState(AuthService.TOKEN_KEY);
  }

  public async setGithubUser(user: string) {
    await this.updateState(AuthService.GITHUB_USER, user);
  }

  public getGithubUser() {
    return this.readState(AuthService.GITHUB_USER);
  }
}
