import * as path from "path"
import globalState from "./globalState"
import * as vscode from "vscode"
import * as fs from "fs"

export function formatHTMLWebviewResourcesUrl(html: string, conversionUrlFn: (link: string) => string) {
  const LinkRegexp = /\s?(?:src|href)=('|")(.*?)\1/gi
  let matcher = LinkRegexp.exec(html)

  while (matcher) {
    const origin = matcher[0]
    const originLen = origin.length
    const link = matcher[2]
    if (!isRemoteLink(link)) {
      let resourceLink = link
      try {
        console.log(`[url:]`, resourceLink, conversionUrlFn(link))
        resourceLink = conversionUrlFn(link)

        html =
          html.substring(0, matcher.index) +
          origin.replace(link, resourceLink) +
          html.substring(matcher.index + originLen)
      } catch (err) {
        console.error(err)
      }
    }
    matcher = LinkRegexp.exec(html)
  }
  return html
}

function isRemoteLink(link: string) {
  return /^(https?|vscode-webview-resource|javascript):/.test(link)
}

export function timezoneDate(timezone: number): Date {
  const date = new Date()
  const diff = date.getTimezoneOffset() // 分钟差
  const gmt = date.getTime() + diff * 60 * 1000
  let nydate = new Date(gmt + timezone * 60 * 60 * 1000)
  return nydate
}

export function getTemplateFileContent(tplPaths: string | string[], webview: vscode.Webview) {
  if (!Array.isArray(tplPaths)) {
    tplPaths = [tplPaths]
  }
  const tplPath = path.join(globalState.context.extensionPath, "template", ...tplPaths)
  const html = fs.readFileSync(tplPath, "utf-8")
  const extensionUri = globalState.context.extensionUri
  const dirUri = tplPaths.slice(0, -1).join("/")
  return formatHTMLWebviewResourcesUrl(html, link => {
    const onDiskPath = vscode.Uri.file(path.join(globalState.context.extensionPath, "template", dirUri, link))
    // return webview.asWebviewUri(onDiskPath).fsPath
    return vscode.Uri.file(onDiskPath.fsPath).with({ scheme: "vscode-resource" }).toString()
    // return webview.asWebviewUri(vscode.Uri.parse([extensionUri, "template", dirUri, link].join("/"))).toString()
  })
}
