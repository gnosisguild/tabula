import { useEffect, useState } from "react"
import { create, IPFSHTTPClient } from "ipfs-http-client"
import useLocalStorage from "./useLocalStorage"
import { Pinning } from "../models/pinning"
import axios from "axios"
import { useNotification } from "./useNotification"

const INFURA_PROJECT_ID = process.env.REACT_APP_IPFS_INFURA_PROJECT_ID
if (INFURA_PROJECT_ID == null) {
  throw new Error("REACT_APP_IPFS_INFURA_PROJECT_ID is not set")
}

const INFURA_SECRET_KEY = process.env.REACT_APP_IPFS_INFURA_SECRET_KEY
if (INFURA_PROJECT_ID == null) {
  throw new Error("REACT_APP_IPFS_INFURA_SECRET_KEY is not set")
}

export const useFiles = () => {
  const [pinning] = useLocalStorage("pinning", undefined)
  const [ipfs, setIpfs] = useState<IPFSHTTPClient | undefined>(undefined)
  const openNotification = useNotification()
  const [isSettingUp, setIsSettingUp] = useState(false)

  useEffect(() => {
    const setup = async () => {
      try {
        const client = create({ url: "http://localhost:5001/api/v0" }) // will connect to a locale node if available
        if (await client.version()) {
          return setIpfs(client)
        }
      } catch (e) {
        // use infura if there are no available locale IPFS node
        try {
          const auth = "Basic " + Buffer.from(INFURA_PROJECT_ID + ":" + INFURA_SECRET_KEY).toString("base64")
          const client = create({
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https",
            headers: {
              authorization: auth,
            },
          })
          if (await client.version()) {
            return setIpfs(client)
          }
        } catch (e) {
          throw Error("Unable to connect to a running IPFS node.")
        }
      } finally {
        setIsSettingUp(false)
      }
    }
    if (ipfs == null && !isSettingUp) {
      setIsSettingUp(true)
      setup()
    }
    // throw Error("Unable to connect to a running IPFS node.")
  }, [ipfs, isSettingUp])

  const uploadFile = async (file: File | string): Promise<{ cid?: any; path: string }> => {
    const result = await (ipfs as IPFSHTTPClient).add(file)
    return {
      cid: result.cid,
      path: result.path,
    }
  }

  const pinAction = async (path: string, name: string, msg?: string) => {
    if (pinning) {
      const pinningService: Pinning = pinning as Pinning
      await axios
        .post(
          `${pinningService.endpoint}/pins`,
          { cid: path, name },
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${pinningService.accessToken}` },
          },
        )
        .then(() => {
          openNotification({
            message: msg ? msg : "Successfully file pinned!",
            variant: "success",
            autoHideDuration: 5000,
            preventDuplicate: true,
          })
        })
        .catch(({ response }) => {
          if (response.data.error.reason !== "DUPLICATE_OBJECT") {
            openNotification({
              message: `Pinning of ${name} failed. [Hash: ${path}]`,
              variant: "error",
              autoHideDuration: 5000,
              preventDuplicate: true,
            })
          }
        })
    }
  }

  const isValidIpfsService = async (data: Pinning): Promise<boolean> => {
    let isValid = false
    await axios
      .get(`${data.endpoint}/pins`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.accessToken}` },
      })
      .then((res) => {
        if (res.status === 200) {
          isValid = true
        }
      })
      .catch((error) => {
        console.error(error)
        isValid = false
      })
    return isValid
  }

  return { ipfs, uploadFile, pinAction, isValidIpfsService }
}
