import { Container } from "@mui/material"
import React from "react"
import Page from "../../layout/Page"

export const PublishersView: React.FC = () => {
  // const { address } = useParams<{ address: string }>()
  // const { data: posts } = usePublishersByAddress(address || "")

  return (
    <Page>
      <Container maxWidth="md">
        {/* {posts &&
          posts.map((post) => (
            <PostPreview key={post.id} post={post} address={address} link={`/${address}/${post.id}`} sx={{ mt: 5 }} />
          ))} */}
      </Container>
    </Page>
  )
}
