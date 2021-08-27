import * as fs from "fs"
import * as os from "os"
import path from "./path"
import * as PATH from "path"
import * as vscode from "vscode"
import { DefaultObject, FLUTTER_PUBSPEC, DocumentYaml } from "./contants"
import { dartCodeExtensionIdentifier } from "./contants"
import * as yaml from "js-yaml"
import { Uri, workspace, extensions } from "vscode"

export const util = {
  getWorkspace() {
    const folders = vscode.workspace.workspaceFolders ?? []
    const rootPath = path.normalize(folders[0]?.uri?.path ?? ``)
    // fix win32 path bug
    if (process.platform === "win32" && rootPath.startsWith(path.sep)) {
      return rootPath.slice(1)
    } else {
      return rootPath
    }
  },

  upperFirstLetter: (word: string) => {
    return (word || "").replace(/^\w/, m => m.toUpperCase())
  },

  lowerFirstLeter: (word: string) => {
    return (word || "").replace(/^\w/, m => m.toLowerCase())
  },

  checkVersion(version1: string, version2: string) {
    const tversion1 = parseInt(version1.replace(/\./g, ""))
    const tversion2 = parseInt(version2.replace(/\./g, ""))
    return tversion1 > tversion2
  },

  /**
   * 获取某个扩展文件相对于webview需要的一种特殊路径格式
   * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  getExtensionFileVscodeResource(context: any, relativePath: string) {
    const diskPath = vscode.Uri.file(path.join(context.extensionPath, relativePath))
    return diskPath.with({ scheme: "vscode-resource" }).toString()
  }
}

export const isWin = process.platform.startsWith("win")

export function fsPath(uri: { fsPath: string } | string) {
  // tslint:disable-next-line:disallow-fspath
  return forceWindowsDriveLetterToUppercase(typeof uri === "string" ? uri : uri.fsPath)
}

export function forceWindowsDriveLetterToUppercase<T extends string | undefined>(
  p: T
): string | (undefined extends T ? undefined : never) {
  if (typeof p !== "string") return undefined as undefined extends T ? undefined : never

  if (p && isWin && PATH.isAbsolute(p) && p.startsWith(p.charAt(0).toLowerCase()))
    return p.substr(0, 1).toUpperCase() + p.substr(1)

  return p
}

export function loadConf<T extends DefaultObject>(key: T): T {
  // process.cwd must call process.chdir & set workspace
  const doc = yaml.load(
    fs.readFileSync(path.normalize(path.join(process.cwd(), FLUTTER_PUBSPEC)), "utf-8")
  ) as DocumentYaml
  const result = {} as any
  if (key && doc) {
    Object.keys(key).forEach(k => {
      result[k] = doc[k]
    })
  }
  return result as T
}

export function isFlutterWorkspaceFolder(folder?: vscode.WorkspaceFolder): boolean {
  return !!(folder && isDartWorkspaceFolder(folder) && isFlutterProjectFolder(fsPath(folder.uri)))
}

export function isDartWorkspaceFolder(folder?: vscode.WorkspaceFolder): boolean {
  if (!folder || folder.uri.scheme !== "file") return false

  // Currently we don't have good logic to know what's a Dart folder.
  // We could require a pubspec, but it's valid to just write scripts without them.
  // For now, nothing calls this that will do bad things if the folder isn't a Dart
  // project so we can review amend this in future if required.
  return true
}

export function isInsideFlutterProject(uri?: Uri): boolean {
  if (!uri) return false

  const projectRoot = locateBestProjectRoot(fsPath(uri))
  if (projectRoot) return isFlutterProjectFolder(projectRoot)
  else return isFlutterWorkspaceFolder(workspace.getWorkspaceFolder(uri))
}

export function locateBestProjectRoot(folder: string): string | undefined {
  if (!folder || !isWithinWorkspace(folder)) return undefined

  let dir = folder
  while (dir !== PATH.dirname(dir)) {
    if (hasPubspec(dir) || hasPackagesFile(dir)) return dir
    dir = PATH.dirname(dir)
  }

  return undefined
}

export function isWithinWorkspace(file: string) {
  return !!workspace.getWorkspaceFolder(Uri.file(file))
}

export function isPathInsideFlutterProject(path: string): boolean {
  const projectRoot = locateBestProjectRoot(path)
  if (!projectRoot) return false

  return isFlutterProjectFolder(projectRoot)
}

export function isFlutterProjectFolder(folder?: string): boolean {
  return referencesFlutterSdk(folder)
}

export function referencesFlutterSdk(folder?: string): boolean {
  if (folder && hasPubspec(folder)) {
    const regex = new RegExp("sdk\\s*:\\s*flutter", "i")
    return regex.test(fs.readFileSync(path.join(folder, "pubspec.yaml")).toString())
  }
  return false
}

export function hasPackagesFile(folder: string): boolean {
  return fs.existsSync(path.join(folder, ".packages"))
}

export function hasPubspec(folder: string): boolean {
  return fs.existsSync(path.join(folder, "pubspec.yaml"))
}

export async function hasPubspecAsync(folder: string): Promise<boolean> {
  return await fileExists(path.join(folder, "pubspec.yaml"))
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.promises.access(p)
    return true
  } catch {
    return false
  }
}

export function resolvePaths<T extends string | undefined>(p: T): string | (undefined extends T ? undefined : never) {
  if (typeof p !== "string") return undefined as undefined extends T ? undefined : never

  if (p.startsWith("~/")) return path.join(os.homedir(), p.substr(2))
  if (!PATH.isAbsolute(p) && workspace.workspaceFolders && workspace.workspaceFolders.length)
    return path.join(fsPath(workspace.workspaceFolders[0].uri), p)
  return p
}

export function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file).toString())
}

export function getExtensionVersion(): string {
  const packageJson = readJson(path.join(extensionPath, "package.json"))
  return packageJson.version
}

export const extensionPath = extensions.getExtension(dartCodeExtensionIdentifier)?.extensionPath ?? ``
