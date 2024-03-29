import { JSONValue, TypedMap, log, dataSource } from "@graphprotocol/graph-ts"
import { NewPost } from "../generated/Poster/Poster"
import { Article, Publication } from "../generated/schema"
import {
  getArticleId,
  getIdFromContent,
  jsonToArrayString,
  jsonToString,
  SUB_ACTION__CREATE,
  SUB_ACTION__DELETE,
  SUB_ACTION__UPDATE,
} from "./utils"
import { store } from "@graphprotocol/graph-ts"
import { ARTICLE_ENTITY_TYPE } from "../tests/util"

export function handleArticleAction(subAction: String, content: TypedMap<string, JSONValue>, event: NewPost): void {
  const publicationId = getIdFromContent(content, "publicationId")

  if (subAction == SUB_ACTION__CREATE) {
    let publication = Publication.load(publicationId)
    if (publication == null) {
      log.error("Article: Publication does not exist.", [publicationId])
      return
    }
    const articleId = getArticleId(event)
    const article = new Article(articleId)

    let articles = publication.articles
    articles.push(articleId)
    publication.articles = articles
    publication.save()

    article.publication = publicationId
    article.poster = event.params.user
    article.article = jsonToString(content.get("article"))
    article.title = jsonToString(content.get("title"))
    article.authors = jsonToArrayString(content.get("authors"))
    article.description = jsonToString(content.get("description"))
    article.image = jsonToString(content.get("image"))
    article.tags = jsonToArrayString(content.get("tags"))
    article.postedOn = event.block.timestamp
    article.lastUpdated = event.block.timestamp
    if (article.publication == null) {
      store.remove(ARTICLE_ENTITY_TYPE, articleId)
      return
    }
    article.save()
    return
  }

  if (subAction == SUB_ACTION__UPDATE) {
    const articleId = getIdFromContent(content, "id")
    const article = Article.load(articleId)

    if (!article) {
      log.info("Trying to update unknown article", [articleId])
      return
    }
    if (article.publication == null) {
      log.error("Article has no publication", [article.id])
    }
    let hasChanges = false
    const theArticle = jsonToString(content.get("article"))
    if (theArticle != "") {
      article.article = theArticle
      hasChanges = true
    }
    const title = jsonToString(content.get("title"))
    if (title != "") {
      article.title = title
      hasChanges = true
    }
    const authorsData = content.get("authors")
    const authors = jsonToArrayString(authorsData)
    if (authorsData != null) {
      article.authors = authors
      hasChanges = true
    }
    const descriptionData = content.get("description")
    const description = jsonToString(descriptionData)
    if (descriptionData != null) {
      if (description == "") {
        article.description = null
      } else {
        article.description = description
      }
      hasChanges = true
    }
    const imageData = content.get("image")
    const image = jsonToString(imageData)
    if (imageData != null) {
      if (image == "") {
        article.image = null
      } else {
        article.image = image
      }
      hasChanges = true
    }
    const tagsData = content.get("tags")
    const tags = jsonToArrayString(tagsData)
    if (tagsData != null) {
      article.tags = tags
      hasChanges = true
    }

    if (hasChanges) {
      article.lastUpdated = event.block.timestamp
      if (article.publication == null) {
        store.remove(ARTICLE_ENTITY_TYPE, articleId)
        return
      }
      article.save()
    }
  }

  if (subAction == SUB_ACTION__DELETE) {
    const articleId = getIdFromContent(content, "id")
    const article = Article.load(articleId)

    if (!article) {
      log.info("Trying to delete unknown article", [articleId])
      return
    }

    const publicationId = article.publication
    const publication = Publication.load(publicationId)

    if (publication) {
      const index = publication.articles.indexOf(articleId)
      if (index >= 0) {
        let articles = publication.articles
        articles.splice(index, 1)
        publication.articles = articles
        publication.save()
      }
    }

    store.remove(ARTICLE_ENTITY_TYPE, articleId)
    return
  }
}
