import * as vscode from "vscode"
import * as path from "path"

import { ImportObject } from "./importDb"

export class ImportFixer {
  private spacesBetweenBraces
  private doubleQuotes
  private useSemiColon

  constructor() {
    let config = vscode.workspace.getConfiguration("autoimport")

    this.useSemiColon = config.get<boolean>("useSemiColon")
    this.spacesBetweenBraces = config.get<boolean>("spaceBetweenBraces")
    this.doubleQuotes = config.get<boolean>("doubleQuotes")
  }

  public fix(
    document: vscode.TextDocument,
    range: vscode.Range | undefined,
    context: vscode.CodeActionContext | undefined,
    token: vscode.CancellationToken | undefined,
    imports: Array<ImportObject>
  ): void {
    let edit = this.getTextEdit(document, imports)

    vscode.workspace.applyEdit(edit)
  }

  public getTextEdit(document: vscode.TextDocument, imports: Array<ImportObject>) {
    let edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit()
    let importObj: vscode.Uri | any = imports[0].file
    let importName: string = imports[0].name

    let relativePath = this.normaliseRelativePath(importObj, this.getRelativePath(document, importObj))

    if (this.alreadyResolved(document, relativePath, importName)) {
      return edit
    }

    if (this.shouldMergeImport(document, relativePath)) {
      edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        this.mergeImports(document, edit, importName, importObj, relativePath)
      )
    } else {
      edit.insert(
        document.uri,
        new vscode.Position(0, 0),
        this.createImportStatement(imports[0].name, relativePath, true)
      )
    }

    return edit
  }

  private alreadyResolved(document: vscode.TextDocument, relativePath: string, importName: string) {
    let exp = new RegExp("(?:import {)(?:.*)(?:} from ')(?:" + relativePath + ")(?:';)")

    let currentDoc = document.getText()

    let foundImport = currentDoc.match(exp)

    if (foundImport && foundImport.length > 0 && foundImport[0].indexOf(importName) > -1) {
      return true
    }

    return false
  }

  private shouldMergeImport(document: vscode.TextDocument, relativePath: string): boolean {
    let currentDoc = document.getText()

    let isCommentLine = (text: string): boolean => {
      let firstTwoLetters = text.trim().substr(0, 2)
      return firstTwoLetters === "//" || firstTwoLetters === "/*"
    }

    return currentDoc.indexOf(relativePath) !== -1 && !isCommentLine(currentDoc)
  }

  private mergeImports(
    document: vscode.TextDocument,
    edit: vscode.WorkspaceEdit,
    name: string,
    file: any,
    relativePath: string
  ) {
    let exp =
      this.useSemiColon === true
        ? new RegExp("(?:import {)(?:.*)(?:} from ')(?:" + relativePath + ")(?:';)")
        : new RegExp("(?:import {)(?:.*)(?:} from ')(?:" + relativePath + ")(?:')")

    let currentDoc = document.getText()

    let foundImport = currentDoc.match(exp)

    if (foundImport) {
      let workingString = foundImport[0]

      let replaceTarget = this.useSemiColon === true ? /{|}|from|import|'|"| |;/gi : /{|}|from|import|'|"| |/gi

      workingString = workingString.replace(replaceTarget, "").replace(relativePath, "")

      let importArray = workingString.split(",")

      importArray.push(name)

      let newImport = this.createImportStatement(importArray.join(", "), relativePath)

      currentDoc = currentDoc.replace(exp, newImport)
    }

    return currentDoc
  }

  private createImportStatement(imp: string, path: string, endline = false): string {
    let formattedPath = path.replace(/\"/g, "").replace(/\'/g, "")

    let returnStr = ""

    if (this.doubleQuotes && this.spacesBetweenBraces) {
      returnStr = `import { ${imp} } from "${formattedPath}";${endline ? "\r\n" : ""}`
    } else if (this.doubleQuotes) {
      returnStr = `import {${imp}} from "${formattedPath}";${endline ? "\r\n" : ""}`
    } else if (this.spacesBetweenBraces) {
      returnStr = `import { ${imp} } from '${formattedPath}';${endline ? "\r\n" : ""}`
    } else {
      returnStr = `import {${imp}} from '${formattedPath}';${endline ? "\r\n" : ""}`
    }

    if (this.useSemiColon === false) {
      returnStr = returnStr.replace(";", "")
    }

    return returnStr
  }

  private getRelativePath(document: vscode.TextDocument, importObj: vscode.Uri | any): string {
    return importObj.discovered ? importObj.fsPath : path.relative(path.dirname(document.fileName), importObj.fsPath)
  }

  private normaliseRelativePath(importObj: { discovered: undefined }, relativePath: string): string {
    let removeFileExtenion = (rp: string) => {
      if (rp) {
        rp = rp.substring(0, rp.lastIndexOf("."))
      }
      return rp
    }

    let makeRelativePath = (rp: string) => {
      let preAppend = "./"

      if (!rp.startsWith(preAppend)) {
        rp = preAppend + rp
      }

      if (/^win/.test(process.platform)) {
        rp = rp.replace(/\\/g, "/")
      }

      return rp
    }

    if (importObj.discovered === undefined) {
      relativePath = makeRelativePath(relativePath)
      relativePath = removeFileExtenion(relativePath)
    }

    return relativePath
  }
}
