import * as vscode from 'vscode';

export class GlobalStateService {
  constructor(private globalState: vscode.Memento) {}

  public async update(key: string, value: any) {
    await this.globalState.update(key, value);
  }

  public get<T>(key: string) {
    return this.globalState.get<T | undefined>(key);
  }

  public async reset(key: string) {
    await this.globalState.update(key, undefined);
  }
}
