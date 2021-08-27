import * as vscode from "vscode"
export class StatusBar {
  static statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1)

  static init() {
    StatusBar.statusBar.text = `feh:working`
    StatusBar.statusBar.show()
  }
}
