import * as vscode from "vscode"
import { DART_MODE, registerCompletionProvider } from "./completions"
import { dartCodeExtensionIdentifier } from "./helpers/contants"
import { isInsideFlutterProject, util } from "./helpers/util"
import { ImportCompletion } from "./importCompletion"
import { SampleProvider1, SampleProvider2, SampleProvider3 } from "./sampleCompletion"
import { ImportDb } from "./importDb"
import { SnippetCompletionItemProvider } from "./snappet"
import { StatusBar } from "./statusBar"
import { scanExtension } from "./scan"
import path from "./helpers/path"

const pluginName = `flutter-extension-helper`
const commands = {
  normalize: `${pluginName}.normalize`
}

export async function activate(context: vscode.ExtensionContext) {
  const rootPath = util.getWorkspace()
  process.chdir(rootPath)
  const disposable = vscode.commands.registerCommand(commands.normalize, () => {
    vscode.window.showInformationMessage(`[${commands.normalize}] ${rootPath}`)
  })

  context.subscriptions.push(disposable)

  // Ensure we have a Dart extension.
  const dartExt = vscode.extensions.getExtension(dartCodeExtensionIdentifier)
  if (!dartExt) {
    // This should not happen since the Flutter extension has a dependency on the Dart one
    // but just in case, we'd like to give a useful error message.
    throw new Error("The Dart extension is not installed, Flutter extension is unable to activate.")
  }
  await dartExt.activate()

  if (!dartExt.exports) {
    vscode.window.showErrorMessage(
      "This plugins depend the Dart extension, but it did not provide an exported API. Maybe it failed to activate?"
    )
    return
  }
  registerCompletionProvider(context)

  let completetion = vscode.languages.registerCompletionItemProvider("dart", new ImportCompletion(context, true), ".")
  context.subscriptions.push(completetion)
  setTimeout(() => {
    scanExtension()
  }, 0)
  // const activeUri = vscode.window.activeTextEditor?.document.uri.path ?? ``
  // console.log(path.resolve(activeUri, "../../main.dart"))

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      DART_MODE,
      new SnippetCompletionItemProvider("../snippets/snippets.json", (uri: vscode.Uri | undefined) =>
        isInsideFlutterProject(uri)
      )
    )
  )
  // 测试代码段
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(DART_MODE, new SampleProvider3()))
  // 测试补全
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(DART_MODE, new SampleProvider1(), ...["."])
  )
  // 测试调用命令
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(DART_MODE, new SampleProvider2(context)))

  StatusBar.init()
  // console.log(vscode.Uri.parse("file://utils/extension.dart?version=1.0"))
  // ImportDb.saveImport(
  //   "abasdasdasd",
  //   "exfffff",
  //   vscode.Uri.parse("./utils"),
  //   vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("/"))!
  // )

  // const dartApi = dartExt.exports._privateApi

  // console.log(dartApi, "\n", dartApi.analyzer.isAnalyzing)
  // if (!dartApi.analyzer.isAnalyzing) {
  //   const r = dartApi.flutterOutlineTreeProvider
  //   console.log(r)
  // }
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log(`deactivate`)
}
