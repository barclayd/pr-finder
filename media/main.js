(function () {
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState();

  const button = document.getElementById('button');
  button.onclick = () => {
    button.innerText = Math.random().toString();
  };
})();
