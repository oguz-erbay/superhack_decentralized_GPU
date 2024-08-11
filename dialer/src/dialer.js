import { createFromJSON } from '@libp2p/peer-id-factory'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from './libp2p.js'
import peerIdDialerJson from './peer-id-dialer.js'
import peerIdListenerJson from './peer-id-listener.js'
import path from 'path'
import { fileToStream, streamToConsole } from './stream.js'
import { fileURLToPath } from 'url'
import fs from 'fs'
import * as lp from 'it-length-prefixed'

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const [idDialer, idListener] = await Promise.all([
    createFromJSON(peerIdDialerJson),
    createFromJSON(peerIdListenerJson)
  ])

  // Create a new libp2p node on localhost with a randomly chosen port
  const nodeDialer = await createLibp2p({
    peerId: idDialer,
    addresses: {
      listen: ['/ip4/10.2.130.192/tcp/0']
    }
  })

  // Output this node's address
  console.log('Dialer ready, listening on:')
  nodeDialer.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString())
  })

  // Dial to the remote peer (the "listener")
  const listenerMa = multiaddr(`/ip4/10.2.130.197/tcp/10333/p2p/${idListener.toString()}`)
  const stream = await nodeDialer.dialProtocol(listenerMa, '/chat/1.0.0')
  console.log('Dialer dialed to listener on protocol: /chat/1.0.0')
  console.log('Sending file kernel.cu')
  //const listenerMa = multiaddr(`/ip4/10.2.130.197/tcp/10333/p2p/${idListener.toString()}`)
  //const stream = await nodeDialer.dialProtocol(listenerMa, '/check_available')
  //console.log('Dialer dialed to listener on protocol: /check_available')

/*
    let response = '';
    for await(const chunk of lp.decode(stream.source)){
      response += Buffer.from(chunk).toString();
    }
    console.log(response.toString())
    if(response.includes("GPU is available")){
      console.log("GPU is available. Sending file...")
      const filePath = path.join(__dirname, '../CUDA/kernel.cu')
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
      } else {
        console.log('File npt found:', filePath);
        // Send the file to the listener
        fileToStream(filePath, stream)
      }
    } else {
      console.log("GPU is in use. No file will be sent.")
    }
*/

  // Define the path to the file you want to send
  const filePath = path.join(__dirname, '../CUDA/kernel.cu')
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  } else {
    console.log('File not found', filePath);
  }
  // Send the file to the listener
  fileToStream(filePath, stream)

  streamToConsole(stream)
}

run()