import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  CompletionTriggerKind,
  Disposable,
  ExtensionContext,
  languages,
  MarkdownString,
  Position,
  Range,
  SnippetString,
  TextDocument
} from "vscode"
import { DelayedCompletionItem } from "./helpers/contants"
import { util } from "./helpers/util"
import * as as from "./helpers/analysisType"

export const DART_MODE = { language: "dart", scheme: "file" }
// 已经导入
const gExistingImports: { [key: string]: { [key: string]: { [key: string]: boolean } } } = {}

function storeExistingImports(notification: as.CompletionExistingImportsNotification) {
  const existingImports = notification.imports

  // Map with key "elementName/elementDeclaringLibraryUri"
  // Value is a set of imported URIs that import that element.
  const alreadyImportedSymbols: { [key: string]: { [key: string]: boolean } } = {}
  for (const existingImport of existingImports.imports) {
    for (const importedElement of existingImport.elements) {
      // This is the symbol name and declaring library. That is, the
      // library that declares the symbol, not the one that was imported.
      // This wil be the same for an element that is re-exported by other
      // libraries, so we can avoid showing the exact duplicate.
      const elementName = existingImports.elements.strings[existingImports.elements.names[importedElement]]
      const elementDeclaringLibraryUri =
        existingImports.elements.strings[existingImports.elements.uris[importedElement]]

      const importedUri = existingImports.elements.strings[existingImport.uri]

      const key = `${elementName}/${elementDeclaringLibraryUri}`
      if (!alreadyImportedSymbols[key]) alreadyImportedSymbols[key] = {}
      alreadyImportedSymbols[key][importedUri] = true
    }
  }

  gExistingImports[notification.file] = alreadyImportedSymbols
}

function provideCompletionItems(
  document: TextDocument,
  position: Position,
  token: CancellationToken,
  context: CompletionContext
) {
  const line = document.lineAt(position.line)

  const projectPath = util.getWorkspace()

  // console.log(`projectPath: ${projectPath}`)

  // 只截取到光标位置为止，防止一些特殊状况
  const lineText = line.text.substring(0, position.character)
  // console.log(`lineText: ${lineText}`)
  const nextCharacter = document
    .getText(new Range(position, position.translate({ characterDelta: 200 })))
    .trim()
    .substr(0, 1)

  // console.log(`nextCharacter: ${nextCharacter}`)

  const tests = new Array(6).fill(0).map(n => ({ key: `flutter${n}`, value: `flutter-value${n}` }))

  return tests.map(item => {
    // vscode.CompletionItemKind 表示提示的类型
    return new CompletionItem(item.key, CompletionItemKind.Field)
  })
}

export function shouldAllowCompletion(line: string, context: CompletionContext): boolean {
  line = line.trim()
  // Filter out auto triggered completions on certain characters based on the previous
  // characters (eg. to allow completion on " if it's part of an import).
  if (context.triggerKind === CompletionTriggerKind.TriggerCharacter) {
    switch (context.triggerCharacter) {
      case "{":
        return line.endsWith("${")
      case "'":
        return line.endsWith("import '") || line.endsWith("export '")
      case '"':
        return line.endsWith('import "') || line.endsWith('export "')
      case "/":
      case "\\":
        return (
          line.startsWith('import "') ||
          line.startsWith('export "') ||
          line.startsWith("import '") ||
          line.startsWith("export '")
        )
    }
  }

  // Otherwise, allow through.
  return true
}

/**
 * 光标选中当前自动补全item时触发动做，通常状况下无需处理 CompletionItem
 */
async function resolveCompletionItem(
  item: DelayedCompletionItem,
  token: CancellationToken
): Promise<CompletionItem | undefined> {
  return item
  // if (!item.suggestion) {
  //   if (!item.documentation && item._documentation) {
  //     item.documentation = item._documentation
  //   }
  //   return item
  // }

  // const res = await this.analyzer.completionGetSuggestionDetails({
  //   file: item.filePath,
  //   id: item.suggestionSetID,
  //   label: item.suggestion.label,
  //   offset: item.offset
  // })

  // if (token && token.isCancellationRequested) {
  //   return
  // }

  // // Rebuild the completion using the additional resolved info.
  // return this.createCompletionItemFromSuggestion(
  //   item.document,
  //   item.offset,
  //   item.nextCharacter,
  //   item.enableCommitCharacters,
  //   item.insertArgumentPlaceholders,
  //   item.replacementOffset,
  //   item.replacementLength,
  //   item.autoImportUri,
  //   item.relevance,
  //   item.suggestion,
  //   res
  // )
}

export function registerCompletionProvider(context: ExtensionContext) {
  // 注册代码建议提示，只有当按下“.”时才触发
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      DART_MODE,
      {
        provideCompletionItems,
        resolveCompletionItem
      },
      "."
    )
  )
}
