import { useState } from "react"
import { useIpfs } from "../../../hooks/useIpfs"
import { Article, Permission, Publications } from "../../../models/publication"
import { createGenericContext } from "../../../utils/create-generic-context"

import { PublicationContextType, PublicationProviderProps } from "./publication.types"

const [usePublicationContext, PublicationContextProvider] = createGenericContext<PublicationContextType>()

const PublicationProvider = ({ children }: PublicationProviderProps) => {
  const [publicationAvatar, setPublicationAvatar] = useState<string>()
  const [currentPath, setCurrentPath] = useState<string>()
  const [publications, setPublications] = useState<Publications[]>()
  const [publication, setPublication] = useState<Publications>()
  const [draftArticle, setDraftArticle] = useState<Article>()
  const [article, setArticle] = useState<Article>()
  const [permission, setPermission] = useState<Permission>()
  const [editingPublication, setEditingPublication] = useState<boolean>(false)
  const [draftPublicationImage, setDraftPublicationImage] = useState<File>()
  const [markdownArticle, setMarkdownArticle] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const ipfs = useIpfs()

  const getIpfsData = async (hash: string) => {
    setLoading(true)
    const data = await ipfs.getText(hash)
    if (data != null) {
      setMarkdownArticle(data)
    }
    setLoading(false)
  }
  const savePublication = (publication?: Publications) => setPublication(publication)
  const savePublications = (publications?: Publications[]) => setPublications(publications)
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
