/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")
const SOF2 = 0xc2
const readSync = filepath => {
  const BUFFER_LENGTH = 1
  const buffer = Buffer.alloc(BUFFER_LENGTH)
  const read = fs.openSync(filepath, "r")
  let bytesRead = BUFFER_LENGTH
  let currentByte
  let previousByte
  let isProgressive = false

  while (bytesRead === BUFFER_LENGTH) {
    bytesRead = fs.readSync(read, buffer, 0, 1)
    currentByte = buffer[0]

    if (previousByte === 0xff && currentByte === SOF2) {
      isProgressive = true
      break
    }

    previousByte = currentByte
  }

  fs.closeSync(read)

  return isProgressive
}
const result = readSync("./images/logo.png")
console.log(result)
