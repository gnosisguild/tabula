import * as ipfsCore from "ipfs-core"
import { create, IPFSHTTPClient } from "ipfs-http-client"

type IPFS = IPFSHTTPClient | ipfsCore.IPFS

let client: IPFS
let ipfsNodeEndpointCached: string | undefined

const ipfsEndpoints = [
  // Node provided by user
  ipfsNodeEndpointCached,
  // Local node
  "http://localhost:5001/api/v0",
]

const publicIpfsEndpoints = [
  // Public nodes
  "https://dweb.link/api/v0",
  "https://gateway.ipfs.io/api/v0",
  "https://ipfs.runfission.com/api/v0",
]

export const getClient = async (ipfsNodeEndpoint?: string): Promise<IPFS> => {
  if (ipfsNodeEndpointCached !== ipfsNodeEndpoint || client == null) {
    ipfsNodeEndpointCached = ipfsNodeEndpoint
    for (const endpoint of ipfsEndpoints) {
      if (endpoint == null) {
        continue
      }
      try {
        const ipfsHttpClient = create({ url: endpoint })
        if (await ipfsHttpClient.version()) {
          console.log(`IPFS getClient: using ipfsHttpClient at ${endpoint}`)
          client = ipfsHttpClient
          return client
        } else {
          console.log(`Unable to connect to IPFS node at ${endpoint}`)
        }
      } catch (ipfsHttpClientError) {
        console.log(`Failed to connect to IPFS node at ${endpoint}`)
      }
    }

    for (const endpoint of publicIpfsEndpoints) {
      try {
        const ipfsHttpClient = create({ url: endpoint })
        if (await ipfsHttpClient.version()) {
          console.log(`IPFS getClient: using ipfsHttpClient at ${endpoint}`)
          client = ipfsHttpClient
          return client
        } else {
          console.log(`Unable to connect to IPFS node at ${endpoint}`)
        }
      } catch (ipfsHttpClientError) {
        console.log(`Failed to connect to IPFS node at ${endpoint}`)
      }
    }

    // TODO: ipfs-js is deprecated, the alternative suggested is https://github.com/ipfs/helia
    // If none of the HTTP client options are available, we spin up an IPFS node in the browser.
    // try {
    //   const ipfsBrowser = await ipfsCore.create({ start: true })
    //   if (ipfsBrowser.isOnline()) {
    //     console.log("IPFS getClient: using ipfsBrowser")
    //     client = ipfsBrowser
    //     return client
    //   } else {
    //     console.log("IPFS setupClient: ipfsBrowser is not online")
    //     throw Error("Unable to connect to IPFS node in browser.")
    //   }
    // } catch (ipfsBrowserError) {
    //   if (ipfsBrowserError instanceof Error && ipfsBrowserError.name === "LockExistsError") {
    //     console.log("IPFS setupClient: ipfsBrowser is already running")
    //   } else {
    //     console.log("Unable to connect to a running IPFS node.")
    //     console.log("Will try to connect to a public IPFS node.")
    //     for (const endpoint of publicIpfsEndpoints) {
    //       try {
    //         const ipfsHttpClient = create({ url: endpoint })
    //         if (await ipfsHttpClient.version()) {
    //           console.log(`IPFS getClient: using ipfsHttpClient at ${endpoint}`)
    //           client = ipfsHttpClient
    //           return client
    //         } else {
    //           console.log(`Unable to connect to IPFS node at ${endpoint}`)
    //         }
    //       } catch (ipfsHttpClientError) {
    //         console.log(`Failed to connect to IPFS node at ${endpoint}`)
    //       }
    //     }
    //   }
    // }
  }

  return client
}
