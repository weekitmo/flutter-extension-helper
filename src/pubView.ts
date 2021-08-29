import { EventEmitter } from "events"
import { ViewColumn, window, commands } from "vscode"
import { getTemplateFileContent } from "./helpers/shared"
import ReusedWebviewPanel from "./helpers/webview"
import * as vscode from "vscode"
import * as path from "path"
import globalState from "./helpers/globalState"
// import axios from "axios"

let _INITED = false

let panelEvents: EventEmitter

export function pubView() {
  const panel = ReusedWebviewPanel.create("flutterPubView", `flutter pub`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true
    // localResourceRoots: [vscode.Uri.file(path.join(globalState.context.extensionPath, "media"))]
  })

  if (_INITED) return
  _INITED = true
  panelEvents = new EventEmitter()

  panel.webview.onDidReceiveMessage(message => {
    panelEvents.emit("onDidReceiveMessage", message)
    switch (message.command) {
      case "alert":
        window.showErrorMessage(message.data)
        return
      case "fail":
        window.showErrorMessage("操作失败！")
        return
      case "pageReady":
        panelEvents.emit("pageReady")

        return
      case "executeCommand":
        commands.executeCommand(message.data)
        return
    }
  }, undefined)

  panel.onDidDispose(() => {
    panelEvents.emit("onDidDispose")

    _INITED = false
  })

  console.log(getTemplateFileContent(["index.html"], panel.webview))
  panel.webview.html = getTemplateFileContent(["index.html"], panel.webview)
}
