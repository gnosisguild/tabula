import { ReactNode } from "react"
import { Article } from "../../../models/publication"

export type ArticleContextType = {
  draftArticle: Article | undefined
  article: Article | undefined
  draftArticleThumbnail: File | undefined
  currentPath: string | undefined
  markdownArticle: string | undefined
  loading: boolean
  ipfsLoading: boolean
  executeArticleTransaction: boolean
  articleEditorState: string | undefined
  setArticleEditorState: (editor: string | undefined) => void
  draftArticlePath: string | undefined
  setDraftArticlePath: (editor: string | undefined) => void
  storeArticleContent: boolean
  setStoreArticleContent: (value: boolean) => void
  showBlockTypePopup: boolean
  setShowBlockTypePopup: (value: boolean) => void
  publishArticle: boolean
  setPublishArticle: (execute: boolean) => void
  setLoading: (loading: boolean) => void
  setIpfsLoading: (loading: boolean) => void
  setExecuteArticleTransaction: (execute: boolean) => void
  getIpfsData: (hash: string) => Promise<string>
  removePublicationImage: boolean
  setRemovePublicationImage: (remove: boolean) => void
  articleContentError: boolean
  setArticleContentError: (error: boolean) => void
  articleTitleError: boolean
  setArticleTitleError: (remove: boolean) => void
  setMarkdownArticle: (markdown: string | undefined) => void
  setDraftArticleThumbnail: (file: File | undefined) => void
  setCurrentPath: (path: string | undefined) => void
  saveDraftArticle: (article: Article | undefined) => void
  saveArticle: (article: Article | undefined) => void
  updateDraftArticle: (key: string, value: string | string[] | null) => void
  linkComponentUrl: string | undefined
  setLinkComponentUrl: (url: string | undefined) => void
  clearArticleState: () => void
  contentImageFiles: File[] | undefined
  setContentImageFiles: (files: File[] | undefined) => void
}

export type ArticleProviderProps = {
  children: ReactNode
}
