/* eslint-disable no-console */

import { createFromJSON, createFromPrivKey } from '@libp2p/peer-id-factory'
import { createLibp2p } from './libp2p.js'
import peerIdListenerJson from './peer-id-listener.js'
import { stdinToStream, streamToConsole } from './stream.js'
import { fileToStream, streamToFile } from './stream.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { pipe } from 'it-pipe'
import * as lp from 'it-length-prefixed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let beingUsed = false;

async function run () {
  // Create a new libp2p node with the given multi-address
  const idListener = await createFromJSON(peerIdListenerJson)
  const nodeListener = await createLibp2p({
    peerId: idListener,
    addresses: {
      listen: ['/ip4/10.2.130.197/tcp/10333']
    }
  })

  // Log a message when a remote peer connects to us
  nodeListener.addEventListener('peer:connect', (evt) => {
    const remotePeer = evt.detail
    console.log('connected to: ', remotePeer.toString())
  })

  await nodeListener.handle('/check_available', async ({ stream }) => {

    const { source, sink } = stream;
    const message = beingUsed ? "GPU is in use." : "GPU is available.";
    const messageBuffer = Buffer.from(message);
    console.log(messageBuffer.toString())
    pipe(
      [messageBuffer],
      (source) => lp.encode(source), // Encode with length prefix
      sink // Write to the stream
    ).catch(err => {
      console.error('Error while sending message:', err);
    });
  })

  // Handle messages for the protocol
  await nodeListener.handle('/chat/1.0.0', async ({ stream }) => {
    // Send stdin to the stream
    //stdinToStream(stream)
    // Read the stream and output to console
    //streamToConsole(stream)
    const targetDir = path.join(__dirname, '/CUDA')
    
    // Ensure the directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    const filePath = path.join(targetDir, 'kernel.cu')
    streamToFile(stream, filePath)
  })

  // Output listen addresses to the console
  console.log('Listener ready, listening on:')
  nodeListener.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString())
  })
}

run()
