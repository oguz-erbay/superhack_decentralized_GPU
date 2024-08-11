/* eslint-disable no-console */

import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import fs from 'fs'
import { promisify } from 'util'
import { Buffer } from 'buffer'
import { fileURLToPath } from 'url'
import path from 'path'
import { exec, spawn } from 'child_process'
import util from 'util'

const readFile = promisify(fs.readFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))


// Function to send file contents to a stream
export async function fileToStream (filePath, stream) {
  try {
    // Read the file
    const fileBuffer = await readFile(filePath)
    // Encode file buffer with length prefix
    const encoded = lp.encode([fileBuffer])
    // Write to the stream
    await pipe(
      encoded,
      stream.sink
    )
    console.log(`File ${filePath} sent successfully.`)
  } catch (err) {
    console.error('Error reading or sending file:', err)
  }
}

// Function to handle received file data
export function streamToFile(stream, outputFilePath) {
  const writeStream = fs.createWriteStream(outputFilePath);

  pipe(
    stream.source,
    (source) => lp.decode(source),
    async (source) => {
      for await (const chunk of source) {
        const buffer = Buffer.concat(chunk.bufs);
        writeStream.write(buffer);
      }
      writeStream.end();
    }
  ).catch((err) => {
    console.error('Error while streaming data to file:', err);
  });

  writeStream.on('finish', () => {
    const newFilePath = path.join(__dirname, 'CUDA', 'kernel_copy.cu');
    fs.copyFile(outputFilePath, newFilePath, (err) => {
      if (err) {
        console.error('Error while copying the file:', err);
        return;
      }
      console.log('File copied successfully to', newFilePath);

      try {
        const cmdProcess = spawn('cmd.exe', [], {
          cwd: path.join(__dirname, 'CUDA'),
          stdio: 'pipe'
        });

        cmdProcess.stdin.write('nvcc kernel_copy.cu\n');
        cmdProcess.stdin.write('a.exe\n');
        cmdProcess.stdin.end();

        let output = '';

      cmdProcess.stdout.on('data', (data) => {
        output += data.toString();
      });


        cmdProcess.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        cmdProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });

        cmdProcess.on('close', (code) => {
          if (code === 0) {
            console.log('CUDA kernel compiled successfully.');
            const lines = output.split('\n');

            // Find index of the line with 'a.exe'
            const startIdx = lines.findIndex(line => line.includes('a.exe')) + 1;

            // Extract matrix results from the following lines
            const matrixResults = lines.slice(startIdx, -1).filter(line => line.trim().length > 0);
            
            const resultsBuffer = Buffer.from(matrixResults.join('\n'));

            pipe(
              [resultsBuffer],
              (source) => lp.encode(source), // Encode with length prefix
              stream.sink // Write to the stream
            ).catch(err => {
              console.error('Error while sending CUDA output:', err);
            });
          } else {
            console.error(`Process exited with code: ${code}`);
          }
        });
      } catch (error) {
        console.error('Error during compilation:', error);
      }
    });
  });
}

export function stdinToStream (stream) {
  // Read utf-8 from stdin
  process.stdin.setEncoding('utf8')
  pipe(
    // Read from stdin (the source)
    process.stdin,
    // Turn strings into buffers
    (source) => map(source, (string) => uint8ArrayFromString(string)),
    // Encode with length prefix (so receiving side knows how much data is coming)
    (source) => lp.encode(source),
    // Write to the stream (the sink)
    stream.sink
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
        console.log('> ' + msg.toString().replace('\n', ''))
      }
    }
  )
}
