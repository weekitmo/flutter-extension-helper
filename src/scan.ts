import * as glob from "glob"
import path from "./helpers/path"
import * as vscode from "vscode"
import { CompletionsCache } from "./cache"

export const exp = new RegExp("^\\s*(?:extension)\\s([^\\s]+)\\son\\s(.+)\\s?{", "gm")
export async function scanExtension() {
  const files = glob.sync(process.cwd().replace(/\\/g, "/") + `/lib/**/*.dart`)

  let completions = []
  for (const file of files) {
    const u8l = await vscode.workspace.fs.readFile(vscode.Uri.parse(file))
    const readStr = Buffer.from(u8l).toString("utf8")
    const hasExt = exp.test(readStr)
    if (hasExt) {
      completions.push(file)
    }
  }
  const workpath = process.cwd().replace(/\\/g, "/")
  const { name, dir } = path.parse(workpath)
  completions = completions.map(item => {
    const importValue = item.replace(`${workpath}/lib`, `package:${name}`)
    return {
      importValue: importValue,
      short: path.parse(item).base,
      wholeRaw: `import '${importValue}';`,
      key: item.replace(`${dir}`, ``),
      origin: item
    }
  })

  console.log(completions)
  CompletionsCache.completions = completions
  return completions
}
