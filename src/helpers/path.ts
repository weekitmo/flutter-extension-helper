import * as path from "path"

export default {
  join: process.platform === "win32" ? path.win32.join : path.posix.join,
  normalize: process.platform === "win32" ? path.win32.normalize : path.posix.normalize,
  parse: process.platform === "win32" ? path.win32.parse : path.posix.parse,
  resolve: process.platform === "win32" ? path.win32.resolve : path.posix.resolve,
  sep: process.platform === "win32" ? path.win32.sep : path.posix.sep
}

export class PathHelper {
  public static normalisePath(relativePath: any) {
    let removeFileExtenion = (rp: string) => {
      if (rp) {
        rp = rp.substring(0, rp.lastIndexOf("."))
      }
      return rp
    }

    let makeRelativePath = (rp: string) => {
      let preAppend = "./"

      if (!rp.startsWith(preAppend) && !rp.startsWith("../")) {
        rp = preAppend + rp
      }

      if (/^win/.test(process.platform)) {
        rp = rp.replace(/\\/g, "/")
      }

      return rp
    }

    relativePath = makeRelativePath(relativePath)
    relativePath = removeFileExtenion(relativePath)

    return relativePath
  }

  public static getRelativePath(a: string, b: string): string {
    return path.relative(path.dirname(a), b)
  }
}
