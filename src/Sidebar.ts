import * as vscode from 'vscode';
import { Message, NewPullRequest, VSCodeData } from '../globals/types';
import { authenticate } from './authenticate';
import { getNonce } from './scriptLimiter';
import { SettingsService } from './services/SettingsService';
import { UserService } from './services/UserService';

export class Sidebar implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private userService: UserService,
    private settingsService: SettingsService,
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    const sendMessage = (type: Message, value: any) => {
      webviewView.webview.postMessage({
        type,
        value,
      });
    };

    const sendUserInfoMessage = () => {
      sendMessage(Message.getUser, this.userService.getUser());
    };

    webviewView.webview.onDidReceiveMessage(async (data: VSCodeData) => {
      switch (data.type) {
        case Message.getUser: {
          sendUserInfoMessage();
          break;
        }
        case Message.getSettings: {
          sendMessage(Message.getSettings, this.settingsService.getSettings());
          break;
        }
        case Message.getTrackedRepos: {
          sendMessage(
            Message.getTrackedRepos,
            this.userService.getTrackedRepos(),
          );
          break;
        }
        case Message.openBrowser: {
          if (!data.value) {
            return;
          }
          vscode.commands.executeCommand(
            'vscode.open',
            vscode.Uri.parse(data.value),
          );
          break;
        }
        case Message.newPullRequest: {
          if (!data.value) {
            return;
          }
          const { title, author, repoName, url }: NewPullRequest = data.value;
          const message = `New PR: ${title} in ${repoName} - opened by ${author.login}`;
          const viewOnGithub = 'View on GitHub';
          const show = await vscode.window.showInformationMessage(
            message,
            viewOnGithub,
          );
          if (show === viewOnGithub) {
            vscode.commands.executeCommand(
              'vscode.open',
              vscode.Uri.parse(url),
            );
          }
          break;
        }
        case Message.onLogin: {
          authenticate(this.userService, sendUserInfoMessage);
          return;
        }
        case Message.setSettings: {
          if (!data.value) {
            return;
          }
          await this.settingsService.setSettings(data.value);
          break;
        }
        case Message.setTrackedRepos: {
          if (!data.value) {
            return;
          }
          await this.userService.setTrackedRepos(data.value);
          break;
        }
        case Message.onLogout: {
          await this.userService.resetUser();
          await this.settingsService.resetSettings();
          break;
        }
        case Message.onInfo: {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case Message.onError: {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'),
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out/compiled', 'sidebar.js'),
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out/compiled', 'sidebar.css'),
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
        			const tsVscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
      <div id="root"></div>
			</body>
			<script src="${scriptUri}"></script>
			</html>`;
  }
}
