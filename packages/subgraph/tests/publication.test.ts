import { Address } from "@graphprotocol/graph-ts"
import { assert, clearStore, test } from "matchstick-as/assembly/index"
import { handleNewPost } from "../src/mapping"
import { getPermissionId, getPublicationHash, getPublicationId } from "../src/utils"
import { createNewPostEvent, PUBLICATION_ENTITY_TYPE, PUBLICATION_TAG, PERMISSION_ENTITY_TYPE } from "./util"

test("An account can can create a publication", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const action = "publication/create"
  const title = "My First Publication"
  const tags = ["test", "cool", "fun"]
  const description = "This is a description"
  const image = "QmaeaxgajiKcT9kiLKrxT6ss6uNg7fg4NkxVvX19utb9Gj"
  const content = `{
    "action": "${action}",
    "title": "${title}",
    "tags": "${tags}",
    "description": "${description}",
    "image": "${image}"
  }`

  const newPostEvent = createNewPostEvent(user, content, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPostEvent)
  handleNewPost(newPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", title)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "description", description)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "image", image)
  assert.notInStore(PUBLICATION_ENTITY_TYPE, publicationId + "_fake")
  clearStore()
})

test("A new publication will get the expected hash attribute", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const action = "publication/create"
  const title = "My First Publication"
  const tags = ["test", "cool", "fun"]
  const description = "This is a description"
  const image = "QmaeaxgajiKcT9kiLKrxT6ss6uNg7fg4NkxVvX19utb9Gj"
  const content = `{
    "action": "${action}",
    "title": "${title}",
    "tags": "${tags}",
    "description": "${description}",
    "image": "${image}"
  }`

  const newPostEvent = createNewPostEvent(user, content, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPostEvent)
  handleNewPost(newPostEvent)

  const expectedPublicationHash = getPublicationHash(publicationId)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "hash", expectedPublicationHash.toHex())
  clearStore()
})

test("An account can update a publication where the account has `publication/update` permissions", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationTitle = "My First Publication"
  const publicationContent = `{
    "action": "publication/create",
    "title": "${publicationTitle}"
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", publicationTitle)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "id", publicationId)

  const newPublicationTitle = "My First Edited Publication"
  const newPublicationDescription = "This is actually the first description for this publication."
  const publicationUpdate = `{
    "action": "publication/update",
    "id": "${publicationId}",
    "title": "${newPublicationTitle}",
    "description": "${newPublicationDescription}"
  }`

  const newPublicationUpdatePostEvent = createNewPostEvent(user, publicationUpdate, PUBLICATION_TAG)
  handleNewPost(newPublicationUpdatePostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", newPublicationTitle)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "description", newPublicationDescription)

  clearStore()
})

test("An account can NOT update a publication where the account does not have `publication/update` permissions", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationTitle = "My First Publication"
  const publicationContent = `{
    "action": "publication/create",
    "title": "${publicationTitle}"
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", publicationTitle)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "id", publicationId)

  const newPublicationTitle = "My First Edited Publication"
  const newPublicationDescription = "This is actually the first description for this publication."
  const publicationUpdate = `{
    "action": "publication/update",
    "id": "${publicationId}",
    "title": "${newPublicationTitle}",
    "description": "${newPublicationDescription}"
  }`

  const otherUser = Address.fromString("0xD028d504316FEc029CFa36bdc3A8f053F6E5a6e4")
  const newPublicationUpdatePostEvent = createNewPostEvent(otherUser, publicationUpdate, PUBLICATION_TAG)
  handleNewPost(newPublicationUpdatePostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", publicationTitle)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "id", publicationId)

  clearStore()
})

test("An account can update a publication where the account is given `publication/update` permissions", () => {
  // create a new publication
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationTitle = "My First Publication"
  const publicationContent = `{
    "action": "publication/create",
    "title": "${publicationTitle}"
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", publicationTitle)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "id", publicationId)

  // give an account permission to update the publication
  const otherUser = Address.fromString("0xD028d504316FEc029CFa36bdc3A8f053F6E5a6e4")
  const publicationSetPermissions = `{
    "action": "publication/permissions",
    "id": "${publicationId}",
    "account": "${otherUser.toHex()}",
    "permissions": {
      "publication/update": true
    }
  }`

  const setPermissionsPostEvent = createNewPostEvent(user, publicationSetPermissions, PUBLICATION_TAG)
  handleNewPost(setPermissionsPostEvent)

  // check that the account can update the publication
  const newPublicationTitle = "My First Edited Publication"
  const newPublicationDescription = "This is actually the first description for this publication."
  const publicationUpdate = `{
    "action": "publication/update",
    "id": "${publicationId}",
    "title": "${newPublicationTitle}",
    "description": "${newPublicationDescription}"
  }`

  const newPublicationUpdatePostEvent = createNewPostEvent(otherUser, publicationUpdate, PUBLICATION_TAG)
  handleNewPost(newPublicationUpdatePostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "title", newPublicationTitle)
  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "description", newPublicationDescription)

  clearStore()
})

test("The account that created the publication can add new, update and delete a publication permissions", () => {
  // create a new publication
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationTitle = "My First Publication"
  const publicationContent = `{
    "action": "publication/create",
    "title": "${publicationTitle}"
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  // give an account permission to update the publication
  const otherUser = Address.fromString("0xD028d504316FEc029CFa36bdc3A8f053F6E5a6e4")
  const publicationSetPermissions = `{
    "action": "publication/permissions",
    "id": "${publicationId}",
    "account": "${otherUser.toHex()}",
    "permissions": {
      "publication/update": true
    }
  }`

  const setPermissionsPostEvent = createNewPostEvent(user, publicationSetPermissions, PUBLICATION_TAG)
  handleNewPost(setPermissionsPostEvent)

  const permissionIdCreator = getPermissionId(publicationId, user)
  const permissionIdOtherUser = getPermissionId(publicationId, otherUser)

  assert.fieldEquals(
    PUBLICATION_ENTITY_TYPE,
    publicationId,
    "permissions",
    "[" + permissionIdCreator + ", " + permissionIdOtherUser + "]",
  )
  assert.fieldEquals(PERMISSION_ENTITY_TYPE, permissionIdOtherUser, "id", permissionIdOtherUser) // check its in the store

  // revoke an account permission to update the publication
  const publicationUpdatePermissions = `{
    "action": "publication/permissions",
    "id": "${publicationId}",
    "account": "${otherUser.toHex()}",
    "permissions": {
      "publication/update": false
    }
  }`
  const updatePermissionsPostEvent = createNewPostEvent(user, publicationUpdatePermissions, PUBLICATION_TAG)
  handleNewPost(updatePermissionsPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "permissions", "[" + permissionIdCreator + "]")
  assert.notInStore(PERMISSION_ENTITY_TYPE, permissionIdOtherUser)

  clearStore()
})

test("An account can delete the publication image of a publication where the account has `publication/update` permissions", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationTitle = "My First Publication"
  const publicationImage = "QmaAgvb4fHsP2HQmdiuWc6k5BBsmxzgdBibgQuGurhfL5m"
  const publicationContent = `{
    "action": "publication/create",
    "title": "${publicationTitle}",
    "image": "${publicationImage}"
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "image", publicationImage)

  const newPublicationTitle = "My First Edited Publication"
  const newPublicationDescription = "This is actually the first description for this publication."
  const publicationUpdate = `{
    "action": "publication/update",
    "id": "${publicationId}",
    "title": "${newPublicationTitle}",
    "description": "${newPublicationDescription}",
    "image": ""
  }`

  const newPublicationUpdatePostEvent = createNewPostEvent(user, publicationUpdate, PUBLICATION_TAG)
  handleNewPost(newPublicationUpdatePostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "image", "null")

  clearStore()
})

test("An account can delete all tags for a publication in a publication where the account has `publication/update` permissions", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationContent = `{
    "action": "publication/create",
    "title": "My First Publication",
    "tags": ["tag1", "tag2"]
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "tags", "[tag1, tag2]")

  const publicationUpdate = `{
    "action": "publication/update",
    "id": "${publicationId}",
    "title": "New Title",
    "tags": ""
  }`

  const newPublicationUpdatePostEvent = createNewPostEvent(user, publicationUpdate, PUBLICATION_TAG)
  handleNewPost(newPublicationUpdatePostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "tags", "[]")

  clearStore()
})

test("An account can updating a publication with tags should not change the tags if no tags key is provided in the update object where the account has `publication/update` permissions", () => {
  const user = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
  const publicationContent = `{
    "action": "publication/create",
    "title": "My First Publication",
    "tags": ["tag1", "tag2"]
  }`

  const newPublicationPostEvent = createNewPostEvent(user, publicationContent, PUBLICATION_TAG)
  const publicationId = getPublicationId(newPublicationPostEvent)
  handleNewPost(newPublicationPostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "tags", "[tag1, tag2]")

  const publicationUpdate = `{
    "action": "publication/update",
    "id": "${publicationId}",
    "title": "New Title"
  }`

  const newPublicationUpdatePostEvent = createNewPostEvent(user, publicationUpdate, PUBLICATION_TAG)
  handleNewPost(newPublicationUpdatePostEvent)

  assert.fieldEquals(PUBLICATION_ENTITY_TYPE, publicationId, "tags", "[tag1, tag2]")

  clearStore()
})
