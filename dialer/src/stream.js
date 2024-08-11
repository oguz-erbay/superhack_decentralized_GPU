import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import fs from 'fs'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'

// Promisify fs.readFile for easier usage
const readFile = promisify(fs.readFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function fileToStream(filePath, stream) {
  const readStream = fs.createReadStream(filePath)
 
  pipe(
    // Read from file
    readStream,
    // Convert chunks to Uint8ArrayList
    (source) => pipe(
      source,
      (source) => {
        // Convert Buffer to Uint8Array
        return map(source, (buf) => Uint8Array.from(buf))
      },
      // Encode with length prefix
      (source) => lp.encode(source),
      // Write to the stream
      stream.sink
    )
  ).then(console.log("Done.")).catch(err => {
    console.error('Error while streaming file to the peer:', err)
  })
}

// Function to handle received file data
export function streamToFile (stream, outputFilePath) {
  pipe(
    // Read from the stream (the source)
    stream.source,
    // Decode length-prefixed data
    (source) => lp.decode(source),
    // Write buffers to file
    async (source) => {
      const writeStream = fs.createWriteStream(outputFilePath)
      for await (const buf of source) {
        writeStream.write(buf)
      }
      writeStream.end()
      console.log(`File received and saved as ${outputFilePath}`)
    }
  )
}

export function streamToConsole (stream) {
  pipe(
    // Read from the stream (the source)
    stream.source,
    // Decode length-prefixed data
    (source) => lp.decode(source),
    // Turn buffers into strings
    (source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
    // Sink function
    async function (source) {
      // For each chunk of data
      for await (const msg of source) {
        // Output the data as a utf8 string
        console.log('> ' + msg.toString())
      }
    }
  )
}