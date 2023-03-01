import React from "react"
import { Box } from "@mui/material"
import PublicationHeader from "./PublicationHeader"
import { Publication } from "../../models/publication"
import { Helmet } from "react-helmet"
import { useDynamicFavIcon } from "../../hooks/useDynamicFavIco"
import { usePublicationContext } from "../../services/publications/contexts"
import usePublication from "../../services/publications/hooks/usePublication"
import { useParams } from "react-router-dom"

type Props = {
  children: React.ReactNode
  publication?: Publication
  showCreatePost?: boolean
}

const PublicationPage: React.FC<Props> = ({ children, publication, showCreatePost }) => {
  const { publicationAvatar } = usePublicationContext()
  const { publicationSlug } = useParams<{ publicationSlug: string }>()
  const { imageSrc } = usePublication(publicationSlug || "")
  useDynamicFavIcon(imageSrc ? imageSrc : publicationAvatar)
  return (
    <>
      <Helmet>
        <title>{publication?.title}</title>
        <meta property="og:title" content={publication?.title} />
        {publication?.description != null && [
          <meta property="og:description" content={publication?.description} key="1" />,
          <meta name="description" content={publication?.description} key="2" />,
        ]}
        <meta property="og:url" content={`https://tabula.gg/#/${publication?.id}`} />
      </Helmet>
      <PublicationHeader publication={publication} showCreatePost={showCreatePost} />
      <Box component="main" sx={{ pb: 12 }}>
        {children}
      </Box>
    </>
  )
}

export default PublicationPage
