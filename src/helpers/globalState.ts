import { ExtensionContext } from "vscode"

let context: ExtensionContext = undefined as unknown as ExtensionContext

let isDevelopment = false // 是否开发环境

export default {
  context,

  isDevelopment
}
