// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { authenticate } from './authenticate';
import { GlobalStateService } from './services/GlobalStateService';
import { SettingsService } from './services/SettingsService';
import { UserService } from './services/UserService';
import { Sidebar } from './Sidebar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate({
  extensionUri,
  subscriptions,
  globalState,
}: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  const globalStateService = new GlobalStateService(globalState);
  const userService = new UserService(globalStateService);
  const settingsService = new SettingsService(globalStateService);

  await settingsService.init();
  const sidebar = new Sidebar(extensionUri, userService, settingsService);
  subscriptions.push(
    vscode.window.registerWebviewViewProvider('pr-finder-sidebar', sidebar),
  );

  subscriptions.push(
    vscode.commands.registerCommand('pr-finder.authenticate', () => {
      // The code you place here will be executed every time your command is executed
      if (!userService.getUser()) {
        authenticate(userService);
      } else {
        vscode.window.showInformationMessage(
          `PR Finder is already logged in with github user ${
            userService.getUser()?.username
          }. To change accounts, logout in PR Finder settings`,
          'Dismiss',
        );
      }
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand('pr-finder.refresh', () => {
      // The code you place here will be executed every time your command is executed
      // Panel.kill();
      // Panel.createOrShow(extensionUri);
      vscode.commands.executeCommand('workbench.action.closeSidebar');
      vscode.commands.executeCommand(
        'workbench.view.extension.pr-finder-sidebar-view',
      );
      setTimeout(() => {
        vscode.commands.executeCommand(
          'workbench.action.webview.openDeveloperTools',
        );
      }, 500);
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
