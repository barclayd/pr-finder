import { ServerResponse } from 'http';
import * as polka from 'polka';
import * as vscode from 'vscode';
import { api } from '../package.json';
import { AuthService } from './services/AuthService';
import { GithubUser } from './types';

const PORT = 54321;

const parseUserData = <T>(data: string): T | undefined => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.log(`Unable to parse data from redirect`);
    return;
  }
};

const onError = (res: ServerResponse) => {
  res.end('<h1>Something went wrong</h1>');
};

export const authenticate = (
  authService: AuthService,
  onSuccess?: () => void,
) => {
  const app = polka();
  app.get('/auth/:userData', async (req, res) => {
    const userData: string | undefined = req.params.userData;
    if (!userData) {
      onError(res);
      return;
    }
    const uriDecodedUserData = decodeURIComponent(userData);
    const dataString = Buffer.from(uriDecodedUserData, 'base64').toString(
      'utf-8',
    );
    const githubData = parseUserData<GithubUser>(dataString);
    if (!githubData) {
      onError(res);
      return;
    }
    await authService.setToken(githubData.accessToken);
    await authService.setGithubUser(githubData.username);
    if (onSuccess) {
      onSuccess();
    }
    res.end('<h1>Successfully authenticated. You can close this now</h1>');
    app.server?.close();
  });
  app.listen(PORT, (error: Error | undefined) => {
    if (error) {
      vscode.window.showErrorMessage(
        'Error occurred in authenticating for PR Finder',
      );
    }
    console.log(`Launched server on port ${PORT} 🚀`);
    vscode.commands.executeCommand(
      'vscode.open',
      vscode.Uri.parse(`${api.production}/auth/github`),
    );
  });
};
