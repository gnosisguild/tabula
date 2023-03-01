import { ethers } from "ethers"
import { useState } from "react"
import { useIpfs } from "../../../hooks/useIpfs"
import { Article, Permission, Publication } from "../../../models/publication"
import { createGenericContext } from "../../../utils/create-generic-context"
import { getTextRecordContent } from "../../ens"

import { PublicationContextType, PublicationProviderProps } from "./publication.types"

const [usePublicationContext, PublicationContextProvider] = createGenericContext<PublicationContextType>()

const PublicationProvider = ({ children }: PublicationProviderProps) => {
  const [publicationAvatar, setPublicationAvatar] = useState<string>()
  const [currentPath, setCurrentPath] = useState<string>()
  const [publications, setPublications] = useState<Publication[]>()
  const [publication, setPublication] = useState<Publication>()
  const [draftArticle, setDraftArticle] = useState<Article>()
  const [article, setArticle] = useState<Article>()
  const [permission, setPermission] = useState<Permission>()
  const [editingPublication, setEditingPublication] = useState<boolean>(false)
  const [draftPublicationImage, setDraftPublicationImage] = useState<File>()
  const [markdownArticle, setMarkdownArticle] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const ipfs = useIpfs()
  const [slugToPublicationId, setSlugToPublicationId] = useState<{ [key: string]: string }>({})

  const getPublicationId = async (publicationSlug: string, provider?: ethers.providers.BaseProvider) => {
    if (slugToPublicationId[publicationSlug]) {
      return slugToPublicationId[publicationSlug]
    } else {
      if (publicationSlug.endsWith(".eth")) {
        const publicationId = await getTextRecordContent(publicationSlug, "tabula", provider)
        if (publicationId) {
          setSlugToPublicationId((prev) => {
            prev[publicationSlug] = publicationId
            return prev
          })
          return publicationId
        }
      } else {
        setSlugToPublicationId((prev) => {
          prev[publicationSlug] = publicationSlug
          return prev
        })
        return publicationSlug
      }
    }
  }

  const getIpfsData = async (hash: string) => {
    setLoading(true)
    const data = await ipfs.getText(hash)
    if (data != null) {
      setMarkdownArticle(data)
    }
    setLoading(false)
  }
  const savePublication = (publication?: Publication) => setPublication(publication)
  const savePublications = (publications?: Publication[]) => setPublications(publications)
  const saveDraftArticle = (article?: Article) => setDraftArticle(article)
  const saveArticle = (article?: Article) => setArticle(article)
  const savePermission = (permission: Permission) => setPermission(permission)
  const saveIsEditing = (isEditing: boolean) => setEditingPublication(isEditing)
  const saveDraftPublicationImage = (file?: File) => setDraftPublicationImage(file)

  return (
    <PublicationContextProvider
      value={{
        publication,
        publications,
        draftArticle,
        article,
        permission,
        editingPublication,
        draftPublicationImage,
        currentPath,
        markdownArticle,
        loading,
        publicationAvatar,
        setPublicationAvatar,
        setMarkdownArticle,
        getIpfsData,
        getPublicationId,
        setCurrentPath,
        saveIsEditing,
        saveDraftPublicationImage,
        savePermission,
        savePublication,
        savePublications,
        saveArticle,
        saveDraftArticle,
      }}
    >
      {children}
    </PublicationContextProvider>
  )
}

export { usePublicationContext, PublicationProvider }
