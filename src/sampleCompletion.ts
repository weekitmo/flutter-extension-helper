import * as vscode from "vscode"
import { util } from "./helpers/util"
import path from "./helpers/path"
import { CompletionsCache } from "./cache"

export class SampleProvider1 implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    let linePrefix = document.lineAt(position).text.substr(0, position.character)
    if (!linePrefix.endsWith("console.")) {
      return undefined
    }

    return [
      new vscode.CompletionItem("table", vscode.CompletionItemKind.Method),
      new vscode.CompletionItem("warn", vscode.CompletionItemKind.Method),
      new vscode.CompletionItem("error", vscode.CompletionItemKind.Method)
    ]
  }
}

// 调用命令插入
export class SampleProvider2 implements vscode.CompletionItemProvider {
  constructor(private context: vscode.ExtensionContext) {
    let fixer = vscode.commands.registerCommand("ex.autoimport", args => {
      console.log(`=>`, args)
      execEdit(args.document, args.value)
    })

    context.subscriptions.push(fixer)
  }
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    // let linePrefix = document.lineAt(position).text.substr(0, position.character)
    // const workspace = util.getWorkspace()
    // const uri = path.parse(workspace)
    // console.log(`[SampleProvider2]: ${linePrefix} `, uri)
    // if (!linePrefix.endsWith("exi")) {
    //   return undefined
    // }

    const result = CompletionsCache.completions.map(item => {
      const commandCompletion = new vscode.CompletionItem(item.short)
      commandCompletion.kind = vscode.CompletionItemKind.Class
      commandCompletion.insertText = ""
      commandCompletion.command = {
        command: "ex.autoimport",
        title: "Flutter Import extension...",
        arguments: [
          {
            document,
            value: item.wholeRaw
          }
        ]
      }
      commandCompletion.documentation = new vscode.MarkdownString(`Flutter import: ${item.importValue}`)
      return commandCompletion
    })

    return result
  }
}

export class SampleProvider3 implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    const snippetCompletion = new vscode.CompletionItem("good", vscode.CompletionItemKind.Snippet)
    // vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
    snippetCompletion.insertText = new vscode.SnippetString("good.${1|morning,evening,afternoon|}")
    snippetCompletion.documentation = new vscode.MarkdownString("Code snippet for good")

    return [snippetCompletion]
  }
}

async function execEdit(document: vscode.TextDocument, value: string) {
  let edit = getTextEdit(document, value)

  vscode.workspace.applyEdit(edit).then(() => console.log(`success`))
}

// const isInsert = true

function getTextEdit(document: vscode.TextDocument, value: string) {
  let edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit()
  console.log(`insert:`, document.uri)
  edit.insert(document.uri, new vscode.Position(0, 0), `${value}\r\n`)
  // if (!isInsert) {
  //   // edit.replace(
  //   //   document.uri,
  //   //   new vscode.Range(0, 0, document.lineCount, 0),
  //   //   this.mergeImports(document, edit, importName, importObj, relativePath)
  //   // )
  // } else {
  //   console.log(`insert`, document.uri)
  //   edit.insert(
  //     document.uri,
  //     new vscode.Position(0, 0),
  //     `import 'package:source_art/extensions/shadow_extensions.dart';`
  //   )
  // }

  return edit
}
