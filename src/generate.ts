import * as fs from "fs"
import path from "./helpers/path"

const standards = [
  `map_extensions.dart`,
  `num_extensions.dart`,
  `other_extensions.dart`,
  `string_extensions.dart`,
  `widget_extensions.dart`
]

export function createExtensionStandard(dist: string) {
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist, { recursive: true })
  }

  standards.forEach(filename => {
    const outputPath = `${dist}${path.sep}${filename}`
    fs.writeFileSync(outputPath, ``)
  })
}
