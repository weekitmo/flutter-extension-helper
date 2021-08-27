import { workspace, WorkspaceConfiguration } from "vscode"

class Conf {
  private config: WorkspaceConfiguration
  constructor() {
    workspace.onDidChangeConfiguration(e => this.reloadConfig())
    this.config = workspace.getConfiguration("dart")
  }
  private reloadConfig() {
    this.config = workspace.getConfiguration("dart")
  }

  get enableSnippets(): boolean {
    return this.getConfig<boolean>("enableSnippets", true)
  }
  private getConfig<T>(key: string, defaultValue: T): NullAsUndefined<T> {
    const value = this.config.get<T>(key, defaultValue)
    return nullToUndefined(value)
  }
}

export type NullAsUndefined<T> = null extends T ? Exclude<T, null> | undefined : T
export function nullToUndefined<T>(value: T): NullAsUndefined<T> {
  return (value === null ? undefined : value) as NullAsUndefined<T>
}

export const config = new Conf()
