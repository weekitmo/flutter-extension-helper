import * as vscode from "vscode"
import { Scantype } from "./helpers/contants"

export class CompletionsCache {
  static completions: Scantype[] = []
}
