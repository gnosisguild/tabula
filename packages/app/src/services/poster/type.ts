import { Article, PermissionAction, Publication } from "../../models/publication"

export enum ArticleAction {
  CREATE = "article/create",
  UPDATE = "article/update",
  DELETE = "article/delete",
}
export enum PublicationAction {
  CREATE = "publication/create",
  UPDATE = "publication/update",
  DELETE = "publication/delete",
  PERMISSIONS = "publication/permissions",
}

export interface PosterCreatePublication extends Omit<Publication, "id" | "hash" | "action"> {}

export interface PosterUpdatePublication extends Omit<Publication, "hash" | "action"> {}

export interface PosterCreateArticle extends Article {
  publicationId: string
  authors?: string[]
}
export interface PosterUpdateArticle extends Article {
  id: string
  authors?: string[]
}

export interface PosterDeleteArticle {
  id: string
}

export interface PosterDeletePublication {
  id: string
}

export interface PosterPermission {
  id: string
  account: string
  permissions: PermissionAction
}
