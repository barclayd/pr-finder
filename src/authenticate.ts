import * as vscode from 'vscode';
import * as polka from 'polka';
import { api } from '../package.json';

const PORT = 54321;

export const authenticate = () => {
  const app = polka();
  app.get('/auth/:userData', (req, res) => {
    const userData: string | undefined = req.params.userData;
    if (!userData) {
      res.end('<h1>Something went wrong</h1>');
    }
    const uriDecodedUserData = decodeURIComponent(userData);
    const data = Buffer.from(uriDecodedUserData, 'base64').toString('utf-8');
    console.log(data);
    res.end('<h1>Successfully authenticated. You can close this now</h1>');
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
