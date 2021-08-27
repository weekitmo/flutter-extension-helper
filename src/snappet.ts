import * as path from "path"
import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  MarkdownString,
  Position,
  SnippetString,
  TextDocument,
  Uri
} from "vscode"
import { extensionPath, readJson } from "./helpers/util"
import { config } from "./helpers/config"

export class SnippetCompletionItemProvider implements CompletionItemProvider {
  private completions = new CompletionList()
  private shouldRender: (uri: Uri) => boolean

  constructor(filename: string, shouldRender: (uri: Uri) => boolean) {
    this.shouldRender = shouldRender
    const snippets = readJson(path.join(__dirname, filename))
    console.log(`read:`, snippets)
    for (const snippetType of Object.keys(snippets)) {
      const snippet = snippets[snippetType]
      const completionItem = new CompletionItem(snippet.prefix, CompletionItemKind.Snippet)
      completionItem.filterText = snippet.prefix
      completionItem.insertText = new SnippetString(
        Array.isArray(snippet.body) ? snippet.body.join("\n") : snippet.body
      )
      completionItem.detail = snippet.description
      completionItem.documentation = new MarkdownString().appendCodeblock(completionItem.insertText.value)
      completionItem.sortText = "zzzzzzzzzzzzzzzzzzzzzz"
      console.log(snippetType, snippet.prefix)
      this.completions.items.push(completionItem)
    }
  }

  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    context: CompletionContext
  ): CompletionList | undefined {
    if (!config.enableSnippets) return

    const line = document.lineAt(position.line).text.slice(0, position.character)
    console.log(`shouldRender:`, this.shouldRender(document.uri))
    console.log(`shouldAllowCompletion:`, this.shouldAllowCompletion(line, context))
    if (!this.shouldAllowCompletion(line, context)) return

    if (!this.shouldRender(document.uri)) return
    console.log(this.completions)
    return this.completions
  }

  private shouldAllowCompletion(line: string, context: CompletionContext): boolean {
    line = line.trim()

    // Don't provide completions after comment markers. This isn't perfect since it'll
    // suppress them for ex if // appears inside strings, but it's a reasonable
    // approximation given we don't have a reliable way to tell that.
    if (line.indexOf("//") !== -1) return false

    // Otherwise, allow through.
    return true
  }
}
