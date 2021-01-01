// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Panel } from './Panel';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({
  extensionUri,
  subscriptions,
}: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "pr-finder" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  subscriptions.push(
    vscode.commands.registerCommand('pr-finder.helloWorld', () => {
      // The code you place here will be executed every time your command is executed
      Panel.createOrShow(extensionUri);
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
