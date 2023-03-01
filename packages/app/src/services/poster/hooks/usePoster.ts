import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react"
import { useIpfs } from "../../../hooks/useIpfs"
import { useNotification } from "../../../hooks/useNotification"
import { useWallet } from "../../../hooks/useWallet"
import { checkIsValidChain } from "../../../utils/validation"
import { usePosterContext } from "../context"
import { getContract } from "../contracts/contract"
import {
  ArticleAction,
  PosterCreateArticle,
  PosterCreatePublication,
  PosterDeleteArticle,
  PosterDeletePublication,
  PosterPermission,
  PosterUpdateArticle,
  PosterUpdatePublication,
  PublicationAction,
} from "../type"
import { chainParameters, SupportedChainId } from "../../../constants/chain"
import usePublication from "../../publications/hooks/usePublication"
import { useParams } from "react-router-dom"

const PUBLICATION_TAG = "PUBLICATION" // PUBLICATION
const POSTER_CONTRACT = process.env.REACT_APP_POSTER_CONTRACT

const usePoster = () => {
  const { publicationSlug } = useParams<{ publicationSlug: string }>()
  const { chainId: publicationChainId } = usePublication(publicationSlug ?? "")
  const openNotification = useNotification()
  const { setTransactionUrl } = usePosterContext()
  const { chainId } = useWeb3React()
  const contract = getContract(POSTER_CONTRACT as string)
  const { signer } = useWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const { pinAction } = useIpfs()
  const [isValidChain, setIsValidChain] = useState<boolean>(false)
  const parameters = chainParameters(chainId ? chainId : SupportedChainId.GOERLI)
  const URL = parameters ? parameters.blockExplorerUrls[0] : "https://goerli.etherscan.io/tx/"
  const properlyNetwork = chainId && checkIsValidChain(chainId, publicationChainId).network

  useEffect(() => {
    if (chainId != null) {
      setIsValidChain(checkIsValidChain(chainId, publicationChainId).isValid)
    }
  }, [isValidChain, publicationChainId, chainId])

  const showChainError = () => {
    return openNotification({
      message: `Wrong network. Please switch to ${properlyNetwork}.`,
      variant: "error",
      autoHideDuration: 5000,
      preventDuplicate: true,
    })
  }

  const showTransactionError = () => {
    return openNotification({
      message: "An error has occurred with your transaction!",
      variant: "error",
      autoHideDuration: 5000,
      preventDuplicate: true,
    })
  }

  const execute = async (content: any, action: PublicationAction | ArticleAction) => {
    if (isValidChain) {
      if (signer) {
        try {
          const poster = contract.connect(signer)
          const tx = await poster.post(JSON.stringify({ ...content, action }), PUBLICATION_TAG)
          return await tx.wait()
        } catch (error: any) {
          showTransactionError()
          throw error
        }
      }
    } else {
      showChainError()
      throw new Error("Invalid chain")
    }
  }

  const createPublication = async (newPublication: PosterCreatePublication): Promise<any> => {
    const content: any = {
      title: newPublication.title,
    }
    if (newPublication.description) {
      content.description = newPublication.description
    }
    if (newPublication.tags?.length) {
      content.tags = newPublication.tags
    }
    if (newPublication.image) {
      content.image = newPublication.image
    }
    try {
      setLoading(true)
      const receipt = await execute(content, PublicationAction.CREATE)
      content.image && (await pinAction(content.image, `${content.title}-image`))
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      return { error: true, message: error.message }
    }
  }

  const updatePublication = async (publicationUpdates: PosterUpdatePublication): Promise<any> => {
    const content: any = {
      title: publicationUpdates.title,
    }
    if (publicationUpdates.description) {
      content.description = publicationUpdates.description
    }
    if (publicationUpdates.tags?.length) {
      content.tags = publicationUpdates.tags
    }
    if (publicationUpdates.image) {
      content.image = publicationUpdates.image
    }
    try {
      setLoading(true)
      const receipt = await execute(content, PublicationAction.UPDATE)
      content.image && (await pinAction(content.image, `${content.title}-image`))
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      showTransactionError()
      return { error: true, message: error.message }
    }
  }

  const deletePublication = async (publicationToDelete: PosterDeletePublication): Promise<any> => {
    const content = publicationToDelete
    try {
      setLoading(true)
      const receipt = await execute(content, PublicationAction.DELETE)
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      return { error: true, message: error.message }
    }
  }

  const createArticle = async (articleToCreate: PosterCreateArticle, pin: boolean): Promise<any> => {
    const content: PosterCreateArticle = {
      title: articleToCreate.title,
      article: articleToCreate.article,
      publicationId: articleToCreate.publicationId,
    }
    if (articleToCreate.description) {
      content.description = articleToCreate.description
    }
    if (articleToCreate.tags?.length) {
      content.tags = articleToCreate.tags
    }
    if (articleToCreate.image) {
      content.image = articleToCreate.image
    }
    if (articleToCreate.authors) {
      content.authors = articleToCreate.authors
    }
    try {
      setLoading(true)
      const receipt = await execute(content, ArticleAction.CREATE)
      content.image && (await pinAction(content.image, `${content.title}-image`, "Successfully image pinned"))
      pin && (await pinAction(content.article, `Article-${content.title}`, "Successfully article pinned"))
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      return { error: true, message: error.message }
    }
  }
  const updateArticle = async (fields: PosterUpdateArticle, pin: boolean): Promise<any> => {
    const content: PosterUpdateArticle = {
      title: fields.title,
      article: fields.article,
      id: fields.id,
    }
    if (fields.description) {
      content.description = fields.description
    }
    if (fields.tags?.length) {
      content.tags = fields.tags
    }
    if (fields.image) {
      content.image = fields.image
    }
    if (fields.authors) {
      content.authors = fields.authors
    }
    try {
      setLoading(true)
      const receipt = await execute(content, ArticleAction.UPDATE)
      content.image &&
        (await pinAction(content.image, `Image-${content.title}-${content.lastUpdated}`, "Successfully image pinned"))
      pin &&
        (await pinAction(
          content.article,
          `Article-${content.title}-${content.lastUpdated}`,
          "Successfully pinned article",
        ))
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      return { error: true, message: error.message }
    }
  }

  const deleteArticle = async (content: PosterDeleteArticle): Promise<any> => {
    try {
      setLoading(true)
      const receipt = await execute(content, ArticleAction.DELETE)
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      return { error: true, message: error.message }
    }
  }

  const givePermission = async (fields: PosterPermission): Promise<any> => {
    const content = fields
    try {
      setLoading(true)
      const receipt = await execute(content, PublicationAction.PERMISSIONS)
      setTransactionUrl(`${URL}tx/${receipt.transactionHash}`)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      return { error: true, message: error.message }
    }
  }

  return {
    createPublication,
    updatePublication,
    deletePublication,
    createArticle,
    deleteArticle,
    givePermission,
    updateArticle,
    loading,
  }
}
export default usePoster
