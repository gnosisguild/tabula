import { ReactNode } from "react"
import { Article, Permission, Publication } from "../../../models/publication"

export type PublicationContextType = {
  publication?: Publication
  publications?: Publication[]
  draftArticle?: Article
  article?: Article
  permission?: Permission
  editingPublication: boolean
  draftPublicationImage?: File
  currentPath?: string
  markdownArticle?: string
  loading: boolean
  publicationAvatar?: string
  setPublicationAvatar: (image?: string) => void
  getIpfsData: (hash: string) => void
  setMarkdownArticle: (markdown?: string) => void
  saveIsEditing: (isEditing: boolean) => void
  saveDraftPublicationImage: (file?: File) => void
  setCurrentPath: (path?: string) => void
  savePermission: (permission: Permission) => void
  saveDraftArticle: (article?: Article) => void
  savePublication: (publication?: Publication) => void
  savePublications: (publications?: Publication[]) => void
  saveArticle: (article?: Article) => void
}

export type PublicationProviderProps = {
  children: ReactNode
}
