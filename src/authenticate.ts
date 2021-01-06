import * as vscode from 'vscode';
import { api } from '../package.json';
export const authenticate = () => {
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`${api.production}/auth/github`))
}
