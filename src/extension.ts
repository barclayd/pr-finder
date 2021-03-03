// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Message } from '../globals/types';
import { authenticate } from './authenticate';
import { Panel } from './Panel';
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
  console.log('user success ' + JSON.stringify(userService.getUser()));
  console.log(
    'settings success ' + JSON.stringify(settingsService.getSettings()),
  );
  const sidebar = new Sidebar(extensionUri, userService, settingsService);
  subscriptions.push(
    vscode.window.registerWebviewViewProvider('pr-finder-sidebar', sidebar),
  );

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  );
  statusBarItem.text = '$(repo-push) Add repo';
  statusBarItem.command = 'pr-finder.addRepo';
  statusBarItem.show();

  subscriptions.push(
    vscode.commands.registerCommand('pr-finder.authenticate', () => {
      // The code you place here will be executed every time your command is executed
      authenticate(userService);
    }),
  );

  subscriptions.push(
    vscode.commands.registerCommand('pr-finder.addRepo', () => {
      // The code you place here will be executed every time your command is executed
      console.log('setup add repo');
      const { activeTextEditor } = vscode.window;
      if (!activeTextEditor) {
        vscode.window.showInformationMessage('No active text editor');
        return;
      }
      const text = activeTextEditor.document.getText(
        activeTextEditor.selection,
      );
      sidebar._view?.webview.postMessage({
        type: Message.addRepo,
        value: text,
      });
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
  subscriptions.push(
    vscode.commands.registerCommand('pr-finder.askQuestion', async () => {
      const answer = await vscode.window.showInformationMessage(
        'How are you cheese?',
        'good',
        'bad',
      );
      if (answer === 'bad') {
        vscode.window.showInformationMessage(
          'Try and have a better day tomorrow',
        );
      }
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
