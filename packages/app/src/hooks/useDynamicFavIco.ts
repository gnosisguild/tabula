import { useEffect } from "react"

export const useDynamicFavIcon = (image: string | null | undefined) => {
  const favIcon = process.env.PUBLIC_URL + "/favicon.ico"
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as any
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.getElementsByTagName("head")[0].appendChild(link)
    }
    link.href = image ? image : favIcon
  }, [favIcon, image])
}
